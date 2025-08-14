import React from "react";
import { useNavigate } from "react-router";

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="font-sans">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-20 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4">Vectorize</h1>
          <p className="text-lg mb-8">
            Convert images into clean, scalable vector graphics effortlessly.
          </p>
          <button
          onClick={()=>navigate('/auth')}
            className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Get Started
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Why Vectorize?</h2>
            <p className="text-gray-500 mt-2">
              Fast, accurate, and beautiful vector conversions.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 border rounded-lg shadow hover:shadow-lg transition">
              <div className="text-4xl text-indigo-500 mb-4">🎯</div>
              <h5 className="text-xl font-semibold mb-2">High Accuracy</h5>
              <p className="text-gray-600">
                Our AI engine ensures perfect vector shapes from any image.
              </p>
            </div>
            <div className="p-6 border rounded-lg shadow hover:shadow-lg transition">
              <div className="text-4xl text-indigo-500 mb-4">⚡</div>
              <h5 className="text-xl font-semibold mb-2">Lightning Fast</h5>
              <p className="text-gray-600">
                Get your vectors in seconds with our optimized processing.
              </p>
            </div>
            <div className="p-6 border rounded-lg shadow hover:shadow-lg transition">
              <div className="text-4xl text-indigo-500 mb-4">🌐</div>
              <h5 className="text-xl font-semibold mb-2">Works Anywhere</h5>
              <p className="text-gray-600">
                Upload from any device, any browser, anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gray-50 text-center">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold mb-2">Start Vectorizing Today</h3>
          <p className="text-gray-500 mb-6">
            Upload your image and see the magic happen.
          </p>
          <a
            href="/upload"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Upload Image
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 text-center py-4">
        <p className="text-gray-500">© 2025 Vectorize. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
