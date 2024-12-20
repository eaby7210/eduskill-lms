from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async


class ChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        if not self.scope.get('user'):
            await self.close()
            return

        self.room_id = self.scope['url_route']['kwargs']['room_id']

        if not await self.can_access_room():
            await self.close()
            return

        self.room_group_name = f'chat_{self.room_id}'
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    @database_sync_to_async
    def can_access_room(self):
        try:
            from django.apps import apps
            ChatRoom = apps.get_model('students', 'ChatRoom')
            room = ChatRoom.objects.select_related(
                'enrollment__student__user',
                'enrollment__course__teacher'
            ).get(id=self.room_id)
            user = self.scope['user']
            # print(f"Checking access for user: {user.username}")
            # print(f"Is authenticated: {user.is_authenticated}")
            # print(f"Has student attr: {hasattr(user, 'student')}")
            # print(f"Has teacher attr: {hasattr(user, 'teacher')}")

            if not user.is_authenticated:
                print("User not authenticated")
                return False
            result = False
            if hasattr(user, 'student'):
                result = room.enrollment.student.user == user
                print(f"Student access check result: {result}")
                if result:
                    print(f"Student {user.username} has access to room {
                          self.room_id}")
                    return result

            if hasattr(user, 'teacher'):
                result = room.enrollment.course.teacher.user == user
                print(f"Teacher access check result: {result}")
                if result:
                    print(f"Teacher {user.username} has access to room {
                          self.room_id}")
                    print(f"Room course teacher: {
                          room.enrollment.course.teacher.user.username}")
                    return result

            return result
        except ChatRoom.DoesNotExist:
            return False

    async def disconnect(self, code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    @database_sync_to_async
    def save_message(self, content):
        """
        Save a new chat message to the database
        """
        from django.apps import apps
        ChatRoom = apps.get_model('students', 'ChatRoom')
        ChatMessage = apps.get_model('students', 'ChatMessage')
        Notification = apps.get_model('core', 'Notification')
        room = ChatRoom.objects.get(id=self.room_id)
        message = ChatMessage.objects.create(
            room=room,
            sender=self.scope['user'],
            content=content
        )
        receiver = self.scope['user']
        print(self.scope['user'])
        if room.enrollment.course.teacher.user.id == self.scope['user']:
            receiver = room.enrollment.student.user
        else:
            receiver = room.enrollment.course.teacher.user
        Notification.objects.create(
            sender=self.scope['user'],
            receiver=receiver,
            message=f"Your have new message from {
                receiver.username
            }",
        )
        # Update the room's last activity
        room.save()  # This updates the updated_at field
        return message

    async def receive_json(self, content):
        action = content.get("action", None)

        if action == "chat_message":
            message = content.get('message')
            if message and message.strip():

                chat_message = await self.save_message(message)

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'sender_id': self.scope['user'].id,
                    'sender_name': self.scope['user'].username,
                    'timestamp': chat_message.timestamp.isoformat()
                }
            )
        elif action == "ping":
            await self.send_json({"message": "pong"})

    async def chat_message(self, event):
        await self.send_json({
            'type': 'chat_message',
            'message': event['message'],
            'sender_id': event['sender_id'],
            'sender_name': event['sender_name'],
            'timestamp': event['timestamp']
        })


class CourseChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        if not self.scope.get('user'):
            await self.close()
            return
        print(self.scope.get("user"))
        self.course_slug = self.scope['url_route']['kwargs']['course_slug']
        print(self.course_slug)
        if not await self.check_course_enrollment():
            await self.close()
            return

        self.room_group_name = f'course_chat_{self.course_slug}'
        print(self.room_group_name)
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    @database_sync_to_async
    def check_course_enrollment(self):
        from django.apps import apps
        Course = apps.get_model('tutor', 'Course')

        try:
            course = Course.objects.get(slug=self.course_slug)
            Enrolment = apps.get_model('students', 'Enrolment')
            if hasattr(self.scope['user'], 'student'):
                return Enrolment.objects.filter(
                    course=course,
                    student=self.scope['user'].student,
                ).exists()

            # If the user is a teacher of this course
            if hasattr(self.scope['user'], 'teacher'):
                return course.teacher.user == self.scope['user']

            return False
        except Course.DoesNotExist:
            return False

    @database_sync_to_async
    def save_message(self, content):
        """
        Save a new chat message to the database
        """
        from django.apps import apps
        CourseChatRoom = apps.get_model('students', 'CourseChatRoom')
        CourseChatMessage = apps.get_model('students', 'CourseChatMessage')
        room = CourseChatRoom.objects.get(course__slug=self.course_slug)
        message = CourseChatMessage.objects.create(
            room=room,
            sender=self.scope['user'],
            content=content
        )
        return message

    async def receive_json(self, content):
        action = content.get("action", None)

        if action == "chat_message":
            message = content.get('message')
            if message and message.strip():
                chat_message = await self.save_message(message)
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message': message,
                        'sender_id': self.scope['user'].id,
                        'sender_name': self.scope['user'].username,
                        'timestamp': chat_message.timestamp.isoformat()
                    }
                )

    async def chat_message(self, event):
        await self.send_json({
            'type': 'chat_message',
            'message': event['message'],
            'sender_id': event['sender_id'],
            'sender_name': event['sender_name'],
            'timestamp': event['timestamp']
        })
