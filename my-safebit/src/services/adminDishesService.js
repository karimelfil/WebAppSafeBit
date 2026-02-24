import { http } from "./http";

const toNonEmptyString = (value) => {
  if (value == null) return "";
  return String(value).trim();
};

const resolveDetailsId = (dish) => {
  const explicit = dish?.dishId ?? dish?.id;
  if (typeof explicit === "number") return String(explicit);

  const explicitStr = toNonEmptyString(explicit);
  if (/^\d+$/.test(explicitStr)) return explicitStr;

  const display = toNonEmptyString(dish?.dishID ?? dish?.dishId ?? dish?.id);
  if (/^\d+$/.test(display)) return display;

  const digits = display.match(/\d+/);
  return digits ? digits[0] : "";
};

const normalizeDish = (dish) => ({
  id: String(dish?.dishID ?? dish?.dishId ?? dish?.id ?? ""),
  detailsId: resolveDetailsId(dish),
  name: dish?.dishName ?? dish?.name ?? "Unknown Dish",
  restaurant: dish?.restaurant ?? "",
  uploadedBy: dish?.uploadedBy ?? "",
  uploadedAt: dish?.uploadDate ?? dish?.uploadedAt ?? null,
});

const extractIngredientName = (item) => {
  if (typeof item === "string") return toNonEmptyString(item);
  if (!item || typeof item !== "object") return "";

  return (
    toNonEmptyString(item.ingredientName) ||
    toNonEmptyString(item.IngredientName) ||
    toNonEmptyString(item.ingredient_Name) ||
    toNonEmptyString(item.ingredient) ||
    toNonEmptyString(item.name) ||
    toNonEmptyString(item.Name) ||
    toNonEmptyString(item.itemName) ||
    toNonEmptyString(item.ItemName) ||
    toNonEmptyString(item.value) ||
    toNonEmptyString(item.Value) ||
    toNonEmptyString(item?.ingredientDto?.name) ||
    toNonEmptyString(item?.ingredientDTO?.name)
  );
};

const pickFirstArray = (candidates) => {
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }
  return [];
};

const normalizeIngredientsPayload = (data) => {
  const source = pickFirstArray([
    data,
    data?.ingredients,
    data?.Ingredients,
    data?.detectedIngredients,
    data?.DetectedIngredients,
    data?.dishIngredients,
    data?.DishIngredients,
    data?.ingredientList,
    data?.IngredientList,
    data?.items,
    data?.Items,
    data?.data,
    data?.data?.ingredients,
    data?.data?.detectedIngredients,
    data?.data?.dishIngredients,
    data?.result,
    data?.result?.ingredients,
    data?.result?.detectedIngredients,
    data?.result?.dishIngredients,
  ]);

  const ingredients = source.map(extractIngredientName).filter(Boolean);

  return {
    ingredients,
  };
};

export async function getAllDishesAdmin() {
  const res = await http.get("/DishesAdmin");
  return (Array.isArray(res.data) ? res.data : []).map(normalizeDish);
}

export async function getDishIngredients(dishId) {
  const res = await http.get(`/DishesAdmin/${encodeURIComponent(dishId)}/ingredients`);
  return normalizeIngredientsPayload(res.data);
}
