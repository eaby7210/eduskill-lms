/* eslint-disable react/prop-types */
import { useState } from "react";
import { Form, useRevalidator } from "react-router-dom";
import apiClient from "../../../apis/interceptors/axios";
import { useErrorHandler } from "../../../hooks/Hooks";

const CategoryAddModal = ({
  selectedCategory,
  closeAddModal,
  categoryData,
  loading,
}) => {
  const [parentCategory, setParentCategory] = useState(
    selectedCategory?.parent ? selectedCategory?.parent : ""
  );
  const handleError = useErrorHandler();
  const [submitting, setSubmitting] = useState(false);

  const revalidator = useRevalidator();

  // Function to filter out categories that cannot be parent categories
  const getEligibleParentCategories = () => {
    return categoryData.filter(
      (category) =>
        // Exclude categories that are already subcategories
        !categoryData.some((parent) =>
          parent.subcategories.some((sub) => sub.id === category.id)
        )
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData(event.target);
      // Add parent category to form data if selected
      if (parentCategory) {
        if (formData.has("parent")) {
          formData.delete("parent");
        }
        formData.append("parent", parentCategory);
      }
      let res = null;
      if (selectedCategory) {
        res = await apiClient.put(
          `/myadmin/category/${selectedCategory.id}/`,
          formData
        );
      } else {
        res = await apiClient.post("/myadmin/category/", formData);
      }
      if (res.status >= 200 && res.status < 300) {
        revalidator.revalidate();
        closeAddModal();
      }
    } catch (error) {
      handleError(error);
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <dialog open className="modal modal-bottom md:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg">
            {selectedCategory ? "Edit Category" : "Add New Category"}{" "}
            {loading && (
              <span className="loading loading-spinner loading-sm"></span>
            )}
          </h3>
          <Form method="post" onSubmit={handleSubmit}>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Category Name</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter category name"
                className="input input-bordered w-full"
                defaultValue={selectedCategory?.name || ""}
                required
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Description</span>
              </label>
              <textarea
                name="description"
                placeholder="Enter category Description"
                className="input input-bordered h-4/6 w-full p-3"
                defaultValue={selectedCategory?.description || ""}
              ></textarea>
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Parent Category (Optional)</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={parentCategory}
                onChange={(e) => setParentCategory(e.target.value)}
                name="parent"
              >
                <option value="">Select Parent Category</option>
                {getEligibleParentCategories().map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-action">
              <button type="button" className="btn" onClick={closeAddModal}>
                Close
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? "Saving..." : selectedCategory ? "Update" : "Add"}
              </button>
            </div>
          </Form>
        </div>
      </dialog>
    </div>
  );
};

export default CategoryAddModal;
