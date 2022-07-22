import React from "react"
import { useForm } from "react-hook-form"

export default function App() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()
  const onSubmit = data => {
    fetch(`/api/form`, {
      method: `POST`,
      body: JSON.stringify(data),
      headers: {
        "content-type": `application/json`,
      },
    })
      .then(res => res.json())
      .then(body => {
        console.log(`response from API:`, body)
      })
  }

  console.log({ errors })

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{ display: `block`, width: 400 }}
    >
      <label htmlFor="first-name">First name</label>
      <input
        id="first-name"
        type="text"
        style={{ display: `block`, marginBottom: 16 }}
        {...register("First name", { required: true, maxLength: 80 })}
      />

      <label htmlFor="last-name">Last name</label>
      <input
        id="last-name"
        type="text"
        style={{ display: `block`, marginBottom: 16 }}
        {...register("Last name", { required: true, maxLength: 100 })}
      />

      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="text"
        style={{ display: `block`, marginBottom: 16 }}
        {...register("Email", { required: true, pattern: /^\S+@\S+$/i })}
      />

      <label htmlFor="tel">Mobile number</label>
      <input
        id="tel"
        type="tel"
        style={{ display: `block`, marginBottom: 16 }}
        {...register("Mobile number", {
          required: true,
          minLength: 6,
          maxLength: 12,
        })}
      />

      <label htmlFor="title">Title</label>
      <select
        {...register("Title", { required: true })}
        style={{ display: `block`, marginBottom: 16 }}
      >
        <option value="Mr">Mr</option>
        <option value="Mrs">Mrs</option>
        <option value="Miss">Miss</option>
        <option value="Dr">Dr</option>
      </select>

      <input type="submit" />
    </form>
  )
}
