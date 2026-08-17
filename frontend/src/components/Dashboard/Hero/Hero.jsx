import "./Hero.css";

function Hero({ user }) {

    const userName = user || "User1";

    const currentHour = new Date().getHours();

    let greeting = "Good Evening";  

    if (currentHour < 12) {
        greeting = "Good Morning";
    } else if (currentHour < 17) {
        greeting = "Good Afternoon";
    }

    const today = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    return (
        <section className="hero">

            <div className="hero-left">
                <h1>
                    {greeting}, <span>{userName}</span> 👋
                </h1>

                <p>
                    Welcome back to Zyoro AI. Continue your journey towards your dream career.
                </p>
            </div>

            <div className="hero-right">
                <span className="hero-date">{today}</span>
            </div>

        </section>
    );
}

export default Hero;