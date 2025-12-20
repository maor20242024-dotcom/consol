export default function LandingPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
            <h1 className="text-4xl font-bold tracking-tighter mb-4">IMPERIUM GATE</h1>
            <p className="text-xl text-gray-400 mb-8 max-w-lg text-center">
                Advanced CRM & Intelligence Console.
            </p>

            <div className="flex gap-4">
                <a
                    href="/en/login"
                    className="px-6 py-3 bg-white text-black font-semibold rounded hover:bg-gray-200 transition"
                >
                    Login
                </a>
            </div>
        </div>
    );
}
