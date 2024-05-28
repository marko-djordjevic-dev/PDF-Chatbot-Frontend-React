import React, { KeyboardEvent, useEffect, useRef, useState } from "react"
import ReactMarkdown from 'react-markdown'
import apiClient from "../utils/apiClient"
import { useToast } from "./toast"
import ChatbotImage from '../assets/icon-chatbot.png'
import UserImage from '../assets/icon-user.png'
import { ThreeDots } from "react-loader-spinner"
import SendImage from '../assets/send-button.png'

interface Props {
    session_id: string | undefined
}

interface Messsage {
    message: string,
    from: 'user' | 'ai'
}

const ChatComponent: React.FC<Props> = ({ session_id }) => {
    const [content, setContent] = useState<string>("")
    const { addToast } = useToast()
    const dummy = useRef<HTMLDivElement>(null)
    const [messages, setMessages] = useState<Messsage[]>([])

    const [suggested, setSuggested] = useState<string>("")
    const [placeholder, setPlaceholder] = useState<string>("")
    const [imageSrc, setImageSrc] = useState('')

    const [isAILoading, setIsAILoading] = useState<boolean>(false);
    const [aiLoadingMessage, setAILoadingMessage] = useState<string>("");
    

    useEffect(() => {
        apiClient.post(`${import.meta.env.VITE_API_URL}/chatbot/chatbot_setting_session`, {
            id: session_id
        })
            .then((response) => {
                const data = response.data
                
                setSuggested(data.suggested)
                setMessages([{ from: 'ai', message: data.initial }])
                setPlaceholder(data.placeholder)
                if (data.img_id) {
                    setImageSrc(`${import.meta.env.VITE_API_URL}/chatbot/avatar/${data.img_id}`)
                }
            })
    }, [session_id])

    const addToMessageQueue = async (message: string, remain: string) => {

        if(remain == "") {
            setMessages(prev => [
                ...prev, {
                    message: message,
                    from: 'ai'
                }
            ]);
            
            setIsAILoading(false);
            setAILoadingMessage("");

            return;
        }
        setAILoadingMessage(message);
        
        const randomNum: number = Math.random() * 20 + 5;
        const randomTime: number = Math.random() * 60 + 20;
        const transfer_len: number = Math.min(randomNum, remain.length);

        message += remain.slice(0, transfer_len);
        remain = remain.slice(transfer_len);

        setTimeout(() => {
            addToMessageQueue(message, remain);
        }, randomTime)

    }

    const sendMessage = async (content: string) => {
        setMessages(prev => [
            ...prev, {
                message: content,
                from: 'user'
            }
        ]);

        setIsAILoading(true);

        apiClient.post(`${import.meta.env.VITE_API_URL}/chatbot/get_ai_response`, {
            message: content,
            session_id: session_id
        })
            .then(response => {
                
                addToMessageQueue("", response.data?.answer);

            })
            .catch(errror => {
                setIsAILoading(false);
                
                addToast(errror.response.data.message, 'error')
            })
        setContent('');
    }

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key == 'Enter' && content && !isAILoading) {
            sendMessage(content);
        }
    }
    
    useEffect(() => {
        dummy.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, aiLoadingMessage])

    useEffect(() => {
        setMessages([])
        setContent('')
    }, [session_id])

    return (
        <div className='w-full h-full flex flex-col gap-3'>
            <div className="overflow-auto h-full p-5">
                {
                    messages.map((message, index) => (
                        <div key={index} className={`chat ${message.from == 'user' ? 'chat-end' : 'chat-start'}`}>
                            <div className="chat-image avatar">
                                <div className="w-10 rounded-full">
                                    <img
                                        alt="PDF Chatbot Avatar"
                                        src={
                                            message.from == 'ai' ? (imageSrc ? imageSrc : ChatbotImage)
                                                : UserImage
                                        } />

                                </div>
                            </div>
                            <div
                                className={`chat-bubble ${message.from == 'ai' ? "bg-base-300" : "bg-primary-content"}`}>
                                <ReactMarkdown className='prose lg:prose-xl max-w-none'>
                                    {message.message}
                                </ReactMarkdown>
                            </div>
                        </div>
                    ))
                }
                { isAILoading &&
                <div className="chat chat-start">
                    <div className="chat-image avatar">
                        <div className="w-10 rounded-full">
                            <img
                                alt="PDF Chatbot Avatar"
                                src={(imageSrc ? imageSrc : ChatbotImage)} 
                            />
                        </div>
                    </div>
                    <div
                        style={{ backgroundColor:  'var(--fallback-pc,oklch(var(--b3)/var(--tw-bg-opacity)))' }}
                        className="chat-bubble bg-base-300"
                    >
                    { aiLoadingMessage == ""
                        ? <ThreeDots
                            visible={true}
                            height="40"
                            width="40"
                            color="#4fa94d"
                            radius="4"
                            ariaLabel="three-dots-loading"
                            wrapperStyle={{}}
                            wrapperClass=""
                        />
                        : <ReactMarkdown className='prose lg:prose-xl max-w-none'>
                            {aiLoadingMessage}
                        </ReactMarkdown>
                    }
                    </div>
                </div>
                }
                <div ref={dummy}></div>
            </div>

            <div className="flex gap-3 flex-wrap py-2 px-5">
                {
                    suggested.split('\n').map((val, index) => val ?
                        <button key={index} className="btn btn-outline" onClick={() => {
                            sendMessage(val);
                        }}>
                            {val}
                        </button>
                        : null)
                }
            </div>
            <div className="flex items-center p-5 pt-0 gap-4">
                <input
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    type="text"
                    className='input input-bordered w-full'
                    placeholder={placeholder}
                    onKeyDown={onKeyDown}
                />
                <button
                    className="btn rounded-xl h-13 px-2 border-neutral-content"
                    onClick={() => {
                        content && sendMessage(content);
                    }}
                    disabled={isAILoading}
                >
                    <img src={SendImage} className="w-10 h-10" />
                </button>
            </div>
        </div>
    )
}

export default ChatComponent