import React, { useState } from "react";
import * as Yup from "yup";

// 👇 Here are the validation errors you will use with Yup.
const validationErrors = {
  fullNameTooShort: "full name must be at least 3 characters",
  fullNameTooLong: "full name must be at most 20 characters",
  sizeIncorrect: "size must be S or M or L",
};

// 👇 Here you will create your schema.

const validationSchema = Yup.object().shape({
  fullname: Yup.string()
    .trim()
    .min(3, validationErrors.fullNameTooShort)
    .max(20, validationErrors.fullNameTooLong)
    .required("Full name is required"),
  size: Yup.string()
    .oneOf(["S", "M", "L"], validationErrors.sizeIncorrect)
    .required("Size is required"),
  toppings: Yup.array(),
});

// 👇 This array could help you construct your checkboxes using .map in the JSX.
const toppings = [
  { topping_id: "1", text: "Pepperoni" },
  { topping_id: "2", text: "Green Peppers" },
  { topping_id: "3", text: "Pineapple" },
  { topping_id: "4", text: "Mushrooms" },
  { topping_id: "5", text: "Ham" },
];

export default function Form() {
  const [formValues, setFormValues] = useState({
    fullname: "",
    size: "",
    toppings: [],
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const validate = async (fieldValues = formValues) => {
    try {
      await validationSchema.validate(fieldValues, { abortEarly: false });
      setFormErrors({});
    } catch (error) {
      const errors = error.inner.reduce((acc, err) => {
        return { ...acc, [err.path]: err.message };
      }, {});
      setFormErrors(errors);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    if (type === "checkbox") {
      setFormValues((prev) => {
        const newToppings = checked
          ? [...prev.toppings, value]
          : prev.toppings.filter((t) => t !== value);
        const updatedValues = { ...prev, toppings: newToppings };
        validate(updatedValues);
        return updatedValues;
      });
    } else {
      setFormValues((prev) => {
        const updatedValues = { ...prev, [name]: value };
        validate(updatedValues);
        return updatedValues;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await validationSchema.validate(formValues, { abortEarly: false });
      setFormErrors({});
      setIsSubmitting(true);

      const numberOfToppings = formValues.toppings.length;
      const sizeText =
        formValues.size === "S"
          ? "small"
          : formValues.size === "M"
          ? "medium"
          : "large";
      const toppingsText =
        numberOfToppings === 0
          ? "no toppings"
          : `${numberOfToppings} topping${numberOfToppings > 1 ? "s" : ""}`;

      const message = `Thank you for your order, ${formValues.fullname}! Your ${sizeText} pizza with ${toppingsText} is on the way.`;

      console.log("Form Values:", formValues); // Debugging
      console.log("Constructed Message:", message); // Debugging

      setSuccessMessage(message);

      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitSuccess(true);
        setFormValues({
          fullname: "",
          size: "",
          toppings: [],
        });
      });
    } catch (error) {
      const errors = error.inner.reduce(
        (acc, err) => ({
          ...acc,
          [err.path]: err.message,
        }),
        {}
      );
      setFormErrors(errors);
      setSubmitSuccess(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Order Your Pizza</h2>
      {submitSuccess && <div className="success">{successMessage}</div>}
      {submitSuccess === false && (
        <div className="failure">Something went wrong</div>
      )}

      <div className="input-group">
        <div>
          <label htmlFor="fullName">Full Name</label>
          <br />
          <input
            placeholder="Type full name"
            id="fullName"
            name="fullname"
            type="text"
            value={formValues.fullname}
            onChange={handleChange}
          />
        </div>
        {formErrors.fullname && (
          <div className="error">{formErrors.fullname}</div>
        )}
      </div>

      <div className="input-group">
        <div>
          <label htmlFor="size">Size</label>
          <br />
          <select
            id="size"
            name="size"
            value={formValues.size}
            onChange={handleChange}
          >
            <option value="">----Choose Size----</option>
            {/* Fill out the missing options */}
            <option value="S">Small</option>
            <option value="M">Medium</option>
            <option value="L">Large</option>
          </select>
        </div>
        {formErrors.size && <div className="error">{formErrors.size}</div>}
      </div>

      <div className="input-group">
        {/* 👇 Maybe you could generate the checkboxes dynamically */}
        {toppings.map((topping) => (
          <label key={topping.topping_id}>
            <input
              name="toppings"
              type="checkbox"
              value={topping.text}
              checked={formValues.toppings.includes(topping.text)}
              onChange={handleChange}
            />
            {topping.text}
            <br />
          </label>
        ))}
      </div>
      {/* 👇 Make sure the submit stays disabled until the form validates! */}
      <input
        type="submit"
        disabled={
          Object.keys(formErrors).length > 0 ||
          !formValues.fullname ||
          !formValues.size ||
          isSubmitting
        }
      />
    </form>
  );
}