import React, { KeyboardEvent, useEffect, useRef, useState } from "react"
import ReactMarkdown from 'react-markdown'
import apiClient from "../utils/apiClient"
import { useToast } from "./toast"
import ChatbotImage from '../assets/icon-chatbot.png'
import UserImage from '../assets/icon-user.png'
import { ThreeDots } from "react-loader-spinner"
import SendImage from '../assets/send-button.png'

interface Props {
    session_id: string | undefined,
    activeBot: any,
}

interface Messsage {
    message: string,
    from: 'user' | 'ai'
}

const ChatComponent: React.FC<Props> = ({ session_id }) => {
    const [content, setContent] = useState<string>("")
    const dummy = useRef<HTMLDivElement>(null)
    const [messages, setMessages] = useState<Messsage[]>([])

    const [suggested, setSuggested] = useState<string>("")
    const [placeholder, setPlaceholder] = useState<string>("")
    const [imageSrc, setImageSrc] = useState('')
    const [name, setName] = useState('')

    const [isAILoading, setIsAILoading] = useState<boolean>(false);
    const [aiLoadingMessage, setAILoadingMessage] = useState<string>("");
    const {addToast} = useToast();

    useEffect(() => {
        apiClient.post(`${import.meta.env.VITE_API_URL}/chatbot/chatbot_setting_session`, {
            id: session_id
        })
            .then((response) => {
                const data = response.data
                console.log("data", data)
                setName(data.name)
                setSuggested(data.suggested)
                setMessages([{ from: 'ai', message: data.initial }])
                setPlaceholder(data.placeholder)
                if (data.img_id) {
                    setImageSrc(`${import.meta.env.VITE_API_URL}/chatbot/avatar/${data.img_id}`)
                } else {
                    setImageSrc("");
                }
            })
    }, [session_id])

    const streamPost = async (url: string, payload: any): Promise<void>  => {
        setAILoadingMessage("");
        setContent("")
        const token = localStorage.getItem('token');
    
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
        
            const reader = response.body?.getReader();
            const decoder = new TextDecoder('utf-8');
            let partial = '';
        
            setMessages(prev => [...prev, {
                message: "",
                from: 'ai'
            }]);
    
            setIsAILoading(false);
    
            while (true) {
                if (!reader) break;
                const { done, value } = await reader.read();
                if (done) {
                    break;
                }
                partial += decoder.decode(value);
                setMessages(prev => {
                    let lastMessageFrom = prev[prev.length - 1].from;
                    let newMessages: Messsage[] = [];
                    if (lastMessageFrom === 'ai') {
                        newMessages = [...prev.slice(0, prev.length - 1), { message: partial.trim(), from: 'ai' }]
                    } else {
                        newMessages = [...prev, { message: partial.trim(), from: 'ai' }]
                    }
                    return newMessages
                })
    
                setAILoadingMessage(partial.trim());
            }
        
            setIsAILoading(false);
        } catch (error) {
            setIsAILoading(false);
            addToast("Something went wrong", 'error')
        }
    }

    const sendMessage = async (content: string) => {
        if (isAILoading) return; 
        setMessages([...messages, {
            message: content,
            from: 'user'
        }]);
        
        setIsAILoading(true);

        await streamPost(`${import.meta.env.VITE_API_URL}/chatbot/get_ai_response`, {message: content, session_id})
        setIsAILoading(false);
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
            {
                name && 
                <>
                    <div className="py-6 px-5 flex justify-items-center items-center border-b-2 border-base-content/10">
                        <div className="chat-image avatar mr-3">
                            <div className="w-10 rounded-full">
                                <img
                                    alt="PDF Chatbot Avatar"
                                    src={imageSrc ? imageSrc : ChatbotImage} 
                                />

                            </div>
                        </div>
                        <span className=" text-xl">{name}</span>
                    </div>
                    {/* <div className="divider my-0" /> */}
                </>
            }
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