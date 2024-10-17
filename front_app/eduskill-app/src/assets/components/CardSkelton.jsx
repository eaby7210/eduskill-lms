export default function CardSkelton() {
  return (
    <div className="card lg:card-side bg-base-100 w-fit shadow-xl">
      <figure className="lg:w-52">
        <div className="skeleton xl:h-4/6 2xl:h-full md:h-52 h-52  object-cover"></div>
      </figure>
      <div className="card-body lg:w-11/12">
        <h2 className="card-title">
          <span className="skeleton h-8 lg:w-96"></span>
        </h2>
        <p>
          <span className="skeleton h-5 w-full my-2"></span>
          <span className="skeleton h-5 w-4/5"></span>
        </p>
        <div className="card-actions justify-end">
          <div className="skeleton btn btn-ghost primary w-24 h-10"></div>
        </div>
      </div>
    </div>
  );
}
