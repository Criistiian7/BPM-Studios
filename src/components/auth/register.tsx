import React from "react";
import { useForm } from "react-hook-form";

type FormValues = { name: string; email: string; password: string; };
type Props = { onSwitchToLogin: () => void; onDemoLogin?: () => void; }; 

const Register: React.FC<Props> = ({ onSwitchToLogin, onDemoLogin }) => {
    const { register, handleSubmit, formState: { errors, isSubmitting } } =
     useForm<FormValues>({ defaultValues: { name: "", email: "", password: ""}});

     const onSubmit = (data: FormValues) => {
        console.log("Register submit", data);
     };

    return (
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">Creează cont</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
                <label className="block text-sm font-medium" htmlFor="name">Nume</label>
                <input 
                id="name" 
                {...register("name", { required: "Numele este obligatoriu" })}
                className={`mt-1 w-full px-3 py-2 border rounded ${errors.name ?"border-red-500" : ""}`} 
                />
                {errors.name && <p className="text-sm text-red-600 mt-1">
                    {errors.name.message}</p>}
            </div>
            
            <div> 
                <label className="block text-sm font-medium" htmlFor="email">Email</label>
                <input 
                id="email" 
                type="email"
                {...register("email", {
              required: "Email-ul este obligatoriu",
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Email invalid" }
            })}
            className={`mt-1 w-full px-3 py-2 border rounded ${errors.email ? "border-red-500" : ""}`}
          />
          {errors.email && <p className="text-sm text-red-600 mt-1">
            {errors.email.message}</p>}
        </div>

           <div>
          <label className="block text-sm font-medium" htmlFor="password">Parolă</label>
          <input
            id="password"
            type="password"
            {...register("password", { required: "Parola este obligatorie", minLength: 
                { value: 6, message: "Minim 6 caractere" } })}
            className={`mt-1 w-full px-3 py-2 border rounded ${errors.password ? "border-red-500" : ""}`}
          />
          {errors.password && <p className="text-sm text-red-600 mt-1">
            {errors.password.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} 
        className="w-full bg-indigo-600 text-white py-2 rounded">
          {isSubmitting ? "Se înregistrează..." : "Înregistrare"}
        </button>
      

        <button type="button" onClick={onDemoLogin} 
        className="w-full mt-2 border border-gray-300 text-gray-800 py-2 ronded">
        Continuă cu demo
        </button>
        </form>

      <p className="mt-4 text-sm">
        Ai deja cont?{" "}
        <button type="button" onClick={onSwitchToLogin} 
        className="text-indigo-600">Logare</button>
      </p>
    </div>
  );
};

export default Register;