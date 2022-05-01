import React from "react"
import { useAuth0 } from "@auth0/auth0-react"

const Header = () => {
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0()

  return (
    <header className="bg-gray-100 text-gray-700 body-font border-b">
      <div className="container mx-auto flex flex-wrap pt-3 pb-3 flex-col md:flex-row justify-between items-center">
        <span className="text-xl">Gatsby Hosting Functions</span>

        {isAuthenticated ? (
          <button
            onClick={() => logout({ returnTo: window.location.origin })}
            className="inline-flex items-center text-white bg-gray-600 border-0 py-1 px-3 focus:outline-none hover:bg-gray-800 rounded text-base md:mt-0"
          >
            Logout
            <svg
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="w-4 h-4 ml-1"
              viewBox="0 0 24 24"
            >
              <path d="M5 12h14M12 5l7 7-7 7"></path>
            </svg>
          </button>
        ) : (
          <button
            onClick={() => loginWithRedirect()}
            className="inline-flex items-center text-white bg-gray-600 border-0 py-1 px-3 focus:outline-none hover:bg-gray-800 rounded text-base md:mt-0"
          >
            Login
            <svg
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="w-4 h-4 ml-1"
              viewBox="0 0 24 24"
            >
              <path d="M5 12h14M12 5l7 7-7 7"></path>
            </svg>
          </button>
        )}
      </div>
    </header>
  )
}

export default Header
