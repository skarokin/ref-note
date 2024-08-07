import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { handleLogin } from "@/app/actions";

const Login = () => {
    return (
        <form action={handleLogin}>
            <button type="submit" name="action" value="google" className="flex items-center justify-center p-3 text-sm gap-2 sm:text-base">
                <span className="text-sm sm:text-base">
                    <FontAwesomeIcon icon={faGoogle} />
                </span>
                Sign in with Google
		    </button>
        </form>
    )
}

export default Login;