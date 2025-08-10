import React from 'react'

const Footer = () => {
  return (
    <footer className="bg-slate-800 text-slate-400 mt-10">
        <div className="container mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center space-x-3 mb-4 md:mb-0">
                    <div className="h-10 w-10 flex items-center justify-center">
                       
                    </div>
                    <span className="text-xl font-bold text-white">BLEEP</span>
                   
                </div>
                <div className="text-sm">
                    &copy; {new Date().getFullYear()} BLEEP. All rights reserved.
                </div>
            </div>
        </div>
    </footer>
  )
}

export default Footer