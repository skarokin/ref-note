import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { handleLogin } from "@/app/actions";

const Login = () => {
    return (
        <form action={handleLogin}>
            <button type="submit" name="action" value="google" className="flex items-center justify-center p-3 text-sm gap-2 sm:text-base">
                <span className="text-sm sm:text-base hover:opacity-50 transition-opacity">
                    <FontAwesomeIcon icon={faGoogle} />&nbsp;
                    Sign in with Google
                </span>
		    </button>
        </form>
    )
}

export default Login;