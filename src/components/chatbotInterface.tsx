import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import ChatbotImage from '../assets/icon-chatbot.png'
import UserImage from '../assets/icon-user.png'
import apiClient from "../utils/apiClient";
import { RotatingLines } from "react-loader-spinner"
import { useToast } from './toast';


const ChatbotInterface: React.FC<{ bot_id: string }> = ({ bot_id }) => {
    const [suggested, setSuggested] = useState<string>("");
    const [placeholder, setPlaceholder] = useState<string>("Write your sentences here.");
    const [initial, setInitial] = useState<string>("Hi! How can I assist you toady?");
    const [imageSrc, setImageSrc] = useState('');
    const [file, setFile] = useState<File>();
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const { addToast } = useToast();

    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const f = event.target.files[0]
            setFile(f)
            const reader = new FileReader();

            reader.onloadend = () => {
                if (typeof reader.result == "string") setImageSrc(reader.result);
            };
            if (f) {
                reader.readAsDataURL(f);
            }
        }
    };

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('id', bot_id);
        formData.append('suggested', suggested);
        formData.append('placeholder', placeholder);
        formData.append('initial', initial);
        if (file) formData.append('files', file);

        setIsSubmitting(true);

        apiClient.post(`${import.meta.env.VITE_API_URL}/chatbot/update_chatbot_setting`, formData,
            {
                headers: {
                    "Content-Type": 'multipart/form-data'
                }
            }).then(() => {

                addToast("Successfully updated!!!", 'success')
            }).catch(error => {

                addToast(error.response.data.message, 'error')
            }).finally(() => {

                setIsSubmitting(false);
            })
    }

    useEffect(() => {
        apiClient.post(`${import.meta.env.VITE_API_URL}/chatbot/get_chatbot_setting`, {
            id: bot_id
        })
            .then((response) => {
                const data = response.data
                setSuggested(data.suggested)
                setInitial(data.initial)
                setPlaceholder(data.placeholder)
                if (data.img_id) {
                    setImageSrc(`${import.meta.env.VITE_API_URL}/chatbot/avatar/${data.img_id}`)
                }
                else {
                    setImageSrc("");
                }
            })
    }, [bot_id]);

    return (
        <div className="w-full h-full p-5 flex flex-col gap-3">
            <div className="prose xl:prose-xl">
                <h1>Chat Interface</h1>
            </div>
            <div className="flex flex-row gap-5">
                <form className="form-control gap-2 w-1/2" onSubmit={onSubmit}>
                    <label className="">Initial Messages</label>
                    <textarea
                        value={initial}
                        onChange={(e) => setInitial(e.target.value)}
                        className="textarea textarea-bordered" />
                    <label className="">Message Placeholder</label>
                    <input
                        value={placeholder}
                        type="text"
                        className="input input-bordered"
                        onChange={(e) => setPlaceholder(e.target.value)}
                    />
                    <label className="">Suggested Messages</label>
                    <textarea
                        value={suggested}
                        className="textarea textarea-bordered"
                        onChange={(e) => setSuggested(e.target.value)}
                    />
                    <label className="">Avatar</label>
                    <div className='avatar'>
                        <div className='rounded-full border border-primary' onClick={() => document.getElementById('fileInput')?.click()}>
                            <img
                                src={imageSrc ? imageSrc : ChatbotImage}
                                alt="Upload Preview"
                                style={{ height: '70px', width: '70px', cursor: 'pointer' }} // Style as needed
                            />

                        </div>
                        <input
                            type="file"
                            id="fileInput"
                            onChange={handleImageChange}
                            style={{ display: 'none' }} // Hide the file input
                            accept="image/*" // Accept images only
                        />
                    </div>
                    <button type="submit" className="btn btn-outline mt-5">
                    { isSubmitting
                        ? <RotatingLines
                            visible={true}
                            width="24"
                            strokeWidth="5"
                            animationDuration="0.75"
                            ariaLabel="rotating-lines-loading"
                        />
                        : "Save"
                    }
                    </button>
                </form>
                <div className="h-[500px] border p-3 w-1/2 flex flex-col">
                    <div className="overflow-auto h-full">
                        {
                            initial.split('\n').map((val, index) => (
                                <div key={index} className="chat chat-start">
                                    <div className="chat-image avatar">
                                        <div className="w-10 rounded-full">
                                            <img
                                                alt="Tailwind CSS chat bubble component"
                                                src={imageSrc ? imageSrc : ChatbotImage}
                                            />
                                        </div>
                                    </div>
                                    <div
                                        className="chat-bubble prose xl:prose-xl bg-base-300">
                                        {val}
                                    </div>
                                </div>
                            ))
                        }
                        <div className="chat chat-end">
                            <div className="chat-image avatar">
                                <div className="w-10 rounded-full">
                                    <img alt="Tailwind CSS chat bubble component" src={UserImage} />
                                </div>
                            </div>
                            <div className="chat-bubble bg-primary-content prose xl:prose-xl">
                                Hi
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3 flex-wrap py-3">
                        {
                            suggested.split('\n').map((val, index) => val ?
                                <button key={index} className="btn btn-outline">
                                    {val}
                                </button>
                                : null)
                        }
                    </div>
                    <div>
                        <input
                            type="text"
                            className='input input-bordered w-full'
                            placeholder={placeholder}
                        />
                    </div>
                </div>
            </div>
        </div >
    )
};

export default ChatbotInterface;
