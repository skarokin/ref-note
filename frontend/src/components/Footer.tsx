const Footer = () => {
    return (
        <footer className="absolute bottom-2.5 text-xs/3 sm:text-xs/6 bottom-2 flex flex-col items-center">
            <small>
                <a href="https://github.com/skarokin/ref-note" target="_blank" className="hover:underline">
                    GitHub
                </a>
            </small>
            <small className="font-thin">by&nbsp;
                <a
                    className="hover:underline"
                    href="https://github.com/skarokin"
                    target="_blank">Sean Kim
                </a> &&nbsp;
                <a
                    className="hover:underline"
                    href="https://github.com/akuwuh"
                    target="_blank">Isaac Nguyen
                </a>
            </small>
        </footer>
    )
}

export default Footer;