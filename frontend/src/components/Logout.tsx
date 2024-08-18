import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { handleLogout } from "@/app/actions";

const Logout = () => {
    return (
        <form action={handleLogout}>
            <button type="submit" name="action" value="logout" className="hover:opacity-50 transition-opacity flex items-center justify-center p-3 text-sm gap-2 sm:text-base">
                <span className="text-sm sm:text-base">
                    <FontAwesomeIcon icon={faSignOutAlt} /> 
                </span>
            </button>
        </form>
    )
}

export default Logout;