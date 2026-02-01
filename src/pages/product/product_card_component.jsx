import React from "react";
import { FaDownload } from "react-icons/fa";
import { imgBaseUrl } from "../../../config";

const defaultImageUrl =
	"https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";

const ProductCard = ({ product, onClick, onDownload }) => {
	const imageUrl = product?.primary_image?.file_name
		? `${imgBaseUrl}/${product.primary_image.file_name}`
		: defaultImageUrl;

	return (
		<div
			onClick={() => onClick?.(product)}
			className="group relative cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all bg-white"
		>
			<div className="h-32 bg-gray-100 flex items-center justify-center transition-transform group-hover:scale-105">
				<img
					src={imageUrl}
					alt={product?.name}
					className="w-full h-full object-cover"
					onError={(event) => {
						event.target.src = defaultImageUrl;
					}}
				/>
			</div>

			<div className="p-3">
				<h3 className="text-xs font-semibold text-gray-800 truncate">
					{product?.name}
				</h3>
				<p className="text-[11px] text-gray-500 truncate">
					{product?.category?.name || "Uncategorized"}
				</p>
				<div className="text-xs text-gray-700 font-semibold mt-1">
					৳ {product?.unit_price ?? 0}
				</div>
				<div className="border-t border-gray-200 my-2"></div>

				<div className="flex flex-wrap gap-2 text-[11px] text-gray-700">
					<span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
						{product?.current_stock ?? 0} in stock
					</span>
					{product?.featured ? (
						<span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
							Featured
						</span>
					) : null}
					{product?.todays_deal ? (
						<span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full">
							Today Deal
						</span>
					) : null}
				</div>

				<div className="mt-2 flex justify-end items-center text-gray-600 text-base bg-gray-50 p-2 rounded-lg shadow-md">
					<FaDownload
						className="cursor-pointer text-blue-500 hover:scale-110 transition-transform"
						onClick={(event) => {
							event.stopPropagation();
							onDownload?.(imageUrl);
						}}
					/>
				</div>
			</div>
		</div>
	);
};

export default ProductCard;
