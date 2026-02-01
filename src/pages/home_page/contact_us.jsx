import React, { useState } from "react";
import { useNavigate } from "react-router-dom";  // For redirecting to the homepage
import { useAddContactMutation } from "../../redux/features/user";  // Assuming this hook is already set up

const ContactPage = () => {
    const [name, setName] = useState("");
    const [mobile, setMobile] = useState("");
    const [email, setEmail] = useState("");
    const [question, setQuestion] = useState("");
    const [selectedQuestion, setSelectedQuestion] = useState("");
    const [responseMessage, setResponseMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    // Predefined questions
    const predefinedQuestions = [
        "How much price of this software",
        "What are the panels",
        "Do you have an Android app?",
        "How much time will it take to launch after purchase?",
        "How much time will I get support after purchase?",
    ];

    const [addContact] = useAddContactMutation();  // Using the hook from Redux slice

    // Handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault();

        const formData = {
            name,
            mobile: mobile || null,
            email: email || null,
            question: selectedQuestion || question,  // Use the selected predefined question or custom question
        };

        try {
            setIsSubmitting(true);
            setResponseMessage("");  // Reset response message before submission

            // Use the Redux mutation hook to add the contact query
            const response = await addContact(formData).unwrap();

            // If the response is successful, display a success message and redirect
            if (response.status === 200) {
                setResponseMessage("Your query has been submitted successfully!");
                setTimeout(() => {
                    navigate("/");  // Redirect to the homepage after a successful submission
                }, 2000);  // Redirect after 2 seconds for a smooth user experience
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            setResponseMessage("There was an error submitting your query. Please try again.");
        } finally {
            setIsSubmitting(false);  // Re-enable button after submission
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex justify-center items-center">
            <div className="w-full max-w-lg p-8 bg-white shadow-lg rounded-lg">
                <h1 className="text-3xl font-semibold text-center text-blue-600 mb-6">Contact Developer to purchase the app</h1>
                <h1 className="text-3xl font-semibold text-center text-blue-600 mb-6">ridoyfahim92@gmail.com</h1>
                <h1 className="text-3xl font-semibold text-center text-blue-600 mb-6">01782084390 (whatsapp)</h1>

                <form onSubmit={handleSubmit}>
                    {/* Name Input */}
                    <div className="mb-6">
                        <label htmlFor="name" className="block text-lg text-gray-700 mb-2">
                            Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                            required
                        />
                    </div>

                    {/* Mobile Input */}
                    <div className="mb-6">
                        <label htmlFor="mobile" className="block text-lg text-gray-700 mb-2">
                            Mobile (Optional)
                        </label>
                        <input
                            type="text"
                            id="mobile"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            placeholder="Enter your mobile"
                            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                    </div>

                    {/* Email Input */}
                    <div className="mb-6">
                        <label htmlFor="email" className="block text-lg text-gray-700 mb-2">
                            Email (Optional)
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                    </div>

                    {/* Predefined Question Selection */}
                    <div className="mb-6">
                        <label htmlFor="question" className="block text-lg text-gray-700 mb-2">
                            Select a Predefined Question (Optional)
                        </label>
                        <select
                            id="question"
                            value={selectedQuestion}
                            onChange={(e) => setSelectedQuestion(e.target.value)}
                            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        >
                            <option value="">Select a predefined question</option>
                            {predefinedQuestions.map((predefinedQuestion, index) => (
                                <option key={index} value={predefinedQuestion}>
                                    {predefinedQuestion}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Custom Question Input */}
                    <div className="mb-6">
                        <label htmlFor="custom-question" className="block text-lg text-gray-700 mb-2">
                            Or enter your custom question
                        </label>
                        <textarea
                            id="custom-question"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Enter your question"
                            rows="4"
                            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="mb-6">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full p-4 text-white font-semibold rounded-lg ${isSubmitting ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {isSubmitting ? "Submitting..." : "Submit Query"}
                        </button>
                    </div>
                </form>

                {/* Response Message */}
                {responseMessage && (
                    <div className={`text-center text-lg mt-4 ${isSubmitting ? 'text-orange-500' : 'text-green-500'}`}>
                        {responseMessage}
                    </div>
                )}

                {/* Go to Home Button */}
                <div className="text-center mt-4">
                    <button
                        onClick={() => navigate("/")}
                        className="text-blue-600 font-semibold hover:underline"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
