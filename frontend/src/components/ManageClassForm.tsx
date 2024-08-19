"use client";
import { FormEvent, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faCheck } from '@fortawesome/free-solid-svg-icons';

const ManageClassForm = ({
    formID,
    inputPlaceholder,
    classSettingType,
    classSettingTypeName,
    onSubmitFunction,
}: {
    formID: string;
    inputPlaceholder: string;
    classSettingType: string;
    classSettingTypeName: string | JSX.Element;
    onSubmitFunction: (event: FormEvent<HTMLFormElement>) => Promise<string>;
}) => {
    const [message, setMessage] = useState<string>('');
    const [clicked, setClicked] = useState<boolean>(false);

    // dude honestly for the form.dispatchEvent thing I just had Claude do it for me and it worked lol...
    const handleClickCheck = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setClicked(!clicked);
        const form = document.getElementById(formID) as HTMLFormElement;
        if (form) {
            form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setClicked(!clicked);
        const msg = await onSubmitFunction(event);
        setMessage(msg);
    }

    return (
        <>
            <p className="text-xs sm:text-sm font-bold basis-1/6 grow-0">{classSettingType}</p>
            {
                !clicked &&
                <>
                    <div className="flex flex-col basis-1/2 grow-0">
                        <p className="text-sm sm:text-base">{classSettingTypeName}</p>
                        <p className="text-xs sm:text-sm text-gray-400">{message}</p>
                    </div>
                    <button
                        className="hover:opacity-50 transition-opacity"
                        onClick={() => setClicked(!clicked)}
                    >
                        <FontAwesomeIcon icon={faPen} />
                    </button>
                </>
            }
            {
                clicked &&
                <>
                    <form
                        id={formID}
                        className="basis-1/2 grow-0"
                        onSubmit={handleSubmit}
                    >
                        <input
                            type="text"
                            placeholder={inputPlaceholder}
                            className="bg-[#252525] text-white rounded-md"
                        />
                    </form>
                    <button
                        className="hover:opacity-50 transition-opacity"
                        onClick={handleClickCheck}
                    >
                        <FontAwesomeIcon icon={faCheck} />
                    </button>
                </>
            }
        </>
    );
}

export default ManageClassForm;