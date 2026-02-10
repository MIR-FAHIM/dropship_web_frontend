import React from 'react';
import { useNavigate } from "react-router-dom";
import { useListCategoriesWithChildrenQuery } from "../../../redux/features/category";
import { imgBaseUrl } from "../../../../config";

const ItemsCategory = () => {
  const navigate = useNavigate();

  const defaultImageUrl = 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';

  const { data, error, isLoading } = useListCategoriesWithChildrenQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error fetching categories.</div>;
  }

  const handleImageError = (event) => {
    event.target.src = defaultImageUrl; // Set to the default image if it fails to load
  };

  const categories = data?.data?.data ?? data?.data ?? [];

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Browse Categories</h1>
            <p className="text-sm text-gray-600">Pick a category and explore its subcategories.</p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-gray-500">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            Updated live
          </div>
        </div>

        {categories.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
            No categories available.
          </div>
        ) : (
          <div className="space-y-10">
            {categories.map((category) => (
              <section key={category.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <button
                    type="button"
                    onClick={() => navigate(`/productlist/${category.id}`)}
                    className="group flex items-center gap-4 text-left"
                  >
                    <div className="h-20 w-20 overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
                      <img
                        src={category?.banner?.file_name ? `${imgBaseUrl}/${category.banner.file_name}` : defaultImageUrl}
                        alt={category.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={handleImageError}
                      />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{category.name}</h2>
                      <p className="text-sm text-gray-500">{category.children?.length ?? 0} subcategories</p>
                    </div>
                  </button>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                      Level {category.level ?? 0}
                    </span>
                    {category.featured ? (
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                        Featured
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {category.children?.length ? (
                    category.children.map((child) => (
                      <div
                        key={child.id}
                        className="group rounded-xl border border-gray-200 bg-gray-50 p-4 transition hover:border-blue-300 hover:bg-white"
                      >
                        <button
                          type="button"
                          onClick={() => navigate(`/productlist/${child.id}`)}
                          className="w-full text-left"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600">
                                {child.name}
                              </h3>
                              <p className="mt-1 text-xs text-gray-500">
                                {child.children?.length ?? 0} items in group
                              </p>
                            </div>
                            <span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                              L{child.level ?? 1}
                            </span>
                          </div>
                        </button>

                        {child.children?.length ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {child.children.map((grandchild) => (
                              <button
                                key={grandchild.id}
                                type="button"
                                onClick={() => navigate(`/productlist/${grandchild.id}`)}
                                className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-medium text-gray-600 transition hover:border-blue-300 hover:text-blue-600"
                              >
                                {grandchild.name}
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                      No child categories yet.
                    </div>
                  )}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemsCategory;
