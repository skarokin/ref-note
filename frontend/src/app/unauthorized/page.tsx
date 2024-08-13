import Footer from "@/components/Footer";

const Unauthorized = () => {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            <h1 style={{fontFamily: 'Literata'}} className="text-7xl p-1.5 sm:text-8xl">ref:error</h1>
            <p style={{ fontFamily: 'Raleway' }} className="text-sm font-thin p-0.5 tracking-normal mb-10 sm:text-base tracking-widest">
                ERROR: you are not authorized to view this page. please sign in or verify that you have the correct permissions.
            </p>
            <a href="/" className="hover:opacity-50 transition-opacity p-3 text-sm sm:text-base">Back to home</a>
            <Footer />
        </main>
    )
}

export default Unauthorized;