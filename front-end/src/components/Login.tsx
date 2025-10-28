import React, { useState } from 'react';


function buildPath(route: string): string {
 if (import.meta.env.MODE !== 'development') {
   return 'http://your-domain.com:5001/' + route;
 } else {
   return 'http://localhost:5001/' + route;
 }
}


function Login() {
 const [message, setMessage] = useState('');
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [displayName, setDisplayName] = useState('');
 const [userName, setUserName] = useState('');
 const [confirmPassword, setConfirmPassword] = useState('');
 const [weight, setWeight] = useState('');
 const [height, setHeight] = useState('');
 const [age, setAge] = useState('');
 const [sex, setSex] = useState('male');
 const [isRegister, setIsRegister] = useState(false);


 const handleSetEmail = (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
 const handleSetPassword = (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);
 const handleSetDisplayName = (e: React.ChangeEvent<HTMLInputElement>) => setDisplayName(e.target.value);
 const handleSetUserName = (e: React.ChangeEvent<HTMLInputElement>) => setUserName(e.target.value);
 const handleSetConfirmPassword = (e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value);
 const handleSetWeight = (e: React.ChangeEvent<HTMLInputElement>) => setWeight(e.target.value);
 const handleSetHeight = (e: React.ChangeEvent<HTMLInputElement>) => setHeight(e.target.value);
 const handleSetAge = (e: React.ChangeEvent<HTMLInputElement>) => setAge(e.target.value);
 const handleSetSex = (e: React.ChangeEvent<HTMLSelectElement>) => setSex(e.target.value);


 const doLogin = async (event: React.FormEvent) => {
   event.preventDefault();
   const obj = { email: email, password: password };
   const js = JSON.stringify(obj);


   try {
     const response = await fetch(buildPath('api/auth/login'), {
       method: 'POST',
       body: js,
       headers: { 'Content-Type': 'application/json' },
     });


     const res = await response.json();


     if (!res.success) {
       setMessage(res.message || 'Login failed');
     } else {
       setMessage('');
       // Store token from res.data.token
       localStorage.setItem('token', res.data.token);
       localStorage.setItem('user_data', JSON.stringify(res.data));
       window.location.href = '/leaderboard';
     }
   } catch (e: any) {
     setMessage('Login error: ' + e.toString());
   }
 };


 const doRegister = async (event: React.FormEvent) => {
   event.preventDefault();
  
   if (password !== confirmPassword) {
     setMessage('Passwords do not match');
     return;
   }


   const obj = {
     displayName: displayName,
     email: email,
     password: password,
     userName: userName,
     weight: weight ? Number(weight) : undefined,
     height: height ? Number(height) : undefined,
     age: age ? Number(age) : undefined,
     sex: sex
   };
   const js = JSON.stringify(obj);


   try {
     const response = await fetch(buildPath('api/auth/register'), {
       method: 'POST',
       body: js,
       headers: { 'Content-Type': 'application/json' },
     });


     const res = await response.json();


     if (!res.success) {
       setMessage(res.message || 'Registration failed');
     } else {
       setMessage('');
       localStorage.setItem('token', res.data.token);
       localStorage.setItem('user_data', JSON.stringify(res.data));
       window.location.href = '/leaderboard';
     }
   } catch (e: any) {
     setMessage('Registration error: ' + e.toString());
   }
 };


 const toggleMode = () => {
   setIsRegister(!isRegister);
   setMessage('');
   setEmail('');
   setPassword('');
   setDisplayName('');
   setUserName('');
   setConfirmPassword('');
   setWeight('');
   setHeight('');
   setAge('');
   setSex('male');
 };


 return (
   <div className="bg-gradient-to-r from-blue-300 via-blue-500 to-blue-900 flex items-center justify-center p-4 min-h-screen relative">
     <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md max-h-screen overflow-y-auto">
       <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
         {isRegister ? 'Create Account' : 'Fitness App Login'}
       </h2>
      
       {message && (
         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
           {message}
         </div>
       )}


       <form onSubmit={isRegister ? doRegister : doLogin}>
         {isRegister && (
           <>
             <div className="mb-4">
               <label className="block text-gray-700 text-sm font-bold mb-2">
                 Display Name *
               </label>
               <input
                 type="text"
                 value={displayName}
                 onChange={handleSetDisplayName}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                 required
               />
             </div>


             <div className="mb-4">
               <label className="block text-gray-700 text-sm font-bold mb-2">
                 Username *
               </label>
               <input
                 type="text"
                 value={userName}
                 onChange={handleSetUserName}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                 required
               />
             </div>
           </>
         )}


         <div className="mb-4">
           <label className="block text-gray-700 text-sm font-bold mb-2">
             Email {isRegister && '*'}
           </label>
           <input
             type="email"
             value={email}
             onChange={handleSetEmail}
             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
             required
           />
         </div>


         <div className="mb-4">
           <label className="block text-gray-700 text-sm font-bold mb-2">
             Password {isRegister && '*'}
           </label>
           <input
             type="password"
             value={password}
             onChange={handleSetPassword}
             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
             required
           />
         </div>


         {isRegister && (
           <>
             <div className="mb-4">
               <label className="block text-gray-700 text-sm font-bold mb-2">
                 Confirm Password *
               </label>
               <input
                 type="password"
                 value={confirmPassword}
                 onChange={handleSetConfirmPassword}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                 required
               />
             </div>


             <div className="mb-4 grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-gray-700 text-sm font-bold mb-2">
                   Weight (kg)
                 </label>
                 <input
                   type="number"
                   value={weight}
                   onChange={handleSetWeight}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                   placeholder="70"
                 />
               </div>
               <div>
                 <label className="block text-gray-700 text-sm font-bold mb-2">
                   Height (cm)
                 </label>
                 <input
                   type="number"
                   value={height}
                   onChange={handleSetHeight}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                   placeholder="175"
                 />
               </div>
             </div>


             <div className="mb-4 grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-gray-700 text-sm font-bold mb-2">
                   Age
                 </label>
                 <input
                   type="number"
                   value={age}
                   onChange={handleSetAge}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                   placeholder="25"
                 />
               </div>
               <div>
                 <label className="block text-gray-700 text-sm font-bold mb-2">
                   Sex
                 </label>
                 <select
                   value={sex}
                   onChange={handleSetSex}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                 >
                   <option value="male">Male</option>
                   <option value="female">Female</option>
                   <option value="other">Other</option>
                 </select>
               </div>
             </div>
           </>
         )}


         <button
           type="submit"
           className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200 mb-4"
         >
           {isRegister ? 'Register' : 'Login'}
         </button>
       </form>


       <div className="text-center">
         <button
           onClick={toggleMode}
           className="text-blue-500 hover:underline"
         >
           {isRegister
             ? 'Already have an account? Login here'
             : "Don't have an account? Register here"}
         </button>
       </div>
     </div>
   </div>
 );
}


export default Login;
