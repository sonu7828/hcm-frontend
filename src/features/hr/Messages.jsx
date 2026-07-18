import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Plus, MoreVertical, Phone, Video, Send, 
  Paperclip, Smile, Image as ImageIcon, MessageSquare, 
  CheckCheck, ChevronLeft, SquarePen
} from 'lucide-react';
import { cn } from '../../utils/cn';

const Messages = () => {
  const [selectedChat, setSelectedChat] = useState(1);
  const [activeTab, setActiveTab] = useState('all');
  const [inputText, setInputText] = useState('');

  const [conversations, setConversations] = useState([
    { id: 1, name: 'Alice Cooper', role: 'Candidate', lastMsg: 'I have shared the updated portfolio link!', time: '10:30 AM', unread: 2, img: 'https://ui-avatars.com/api/?name=Alice+Cooper', status: 'online' },
    { id: 2, name: 'John Wick', role: 'Candidate', lastMsg: 'When can I expect the final feedback?', time: 'Yesterday', unread: 0, img: 'https://ui-avatars.com/api/?name=John+Wick', status: 'offline' },
    { id: 3, name: 'Sarah Johnson', role: 'Team Lead', lastMsg: 'The technical round was impressive.', time: 'Oct 22', unread: 0, img: 'https://ui-avatars.com/api/?name=Sarah+Johnson', status: 'online' },
  ]);

  const [messages, setMessages] = useState({
    1: [
      { id: 1, text: 'Hi Alice, how is the interview preparation going?', time: '09:15 AM', type: 'sent' },
      { id: 2, text: 'Hello! It is going great. I have already reviewed the company culture video you sent.', time: '09:20 AM', type: 'received' },
      { id: 3, text: 'Great! I have shared the updated portfolio link! Please check the latest cases.', time: '10:30 AM', type: 'received' },
    ],
    2: [
      { id: 1, text: 'When can I expect the final feedback?', time: 'Yesterday', type: 'received' }
    ],
    3: [
      { id: 1, text: 'The technical round was impressive.', time: 'Oct 22', type: 'received' }
    ]
  });

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedChat) return;

    const newMessage = {
      id: Date.now(),
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'sent'
    };

    setMessages(prev => ({
      ...prev,
      [selectedChat]: [...(prev[selectedChat] || []), newMessage]
    }));

    setConversations(prev => prev.map(c => 
      c.id === selectedChat ? { ...c, lastMsg: inputText, time: newMessage.time, unread: 0 } : c
    ));

    setInputText('');
  };

  const handleSelectChat = (id) => {
    setSelectedChat(id);
    setConversations(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c));
  };

  const filteredConversations = conversations.filter(c => {
    if (activeTab === 'all') return true;
    if (activeTab === 'candidate' && c.role === 'Candidate') return true;
    if (activeTab === 'teams' && c.role !== 'Candidate') return true;
    return false;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] animate-fade-in focus:outline-none">
      <div className="flex-1 flex overflow-hidden card p-0 border-none bg-white shadow-soft">
        
        <div className={cn("w-full lg:w-96 flex flex-col border-r border-slate-50 transition-all z-10", selectedChat ? "hidden lg:flex" : "flex")}>
          <div className="p-6 border-b border-slate-50 flex items-center justify-between shrink-0">
             <h2 className="text-xl font-extrabold text-slate-900 tracking-tight dark:text-white">Messages</h2>
             <button className="p-2.5 bg-primary-600 text-white rounded-xl shadow-lg shadow-primary-100 hover:bg-primary-700 active:scale-95 transition-all">
                <SquarePen size={20} />
             </button>
          </div>

          <div className="p-6 space-y-4 shrink-0">
             <div className="relative">
                <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                <input type="text" placeholder="Search conversations..." className="input-field pl-10 h-11" />
             </div>
             <div className="flex p-1 bg-slate-50 rounded-xl">
                {['All', 'Candidate', 'Teams'].map((t) => (
                   <button 
                     key={t}
                     onClick={() => setActiveTab(t.toLowerCase())}
                     className={cn("flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all", activeTab === t.toLowerCase() ? "bg-white text-primary-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}
                   >
                      {t}
                   </button>
                ))}
             </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide divide-y divide-slate-50">
             {filteredConversations.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => handleSelectChat(chat.id)}
                  className={cn("w-full p-6 flex items-start gap-4 transition-all hover:bg-slate-50/50 text-left relative group", selectedChat === chat.id ? "bg-primary-50/30 ring-1 ring-primary-100/50" : "")}
                >
                   <div className="relative shrink-0">
                      <img src={chat.img} alt={chat.name} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white shadow-sm" />
                      <div className={cn("absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white", chat.status === 'online' ? "bg-emerald-500" : "bg-slate-300")} />
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                         <h4 className="text-sm font-bold text-slate-900 truncate dark:text-white">{chat.name}</h4>
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{chat.time}</span>
                      </div>
                      <p className="text-xs font-medium text-slate-500 truncate mb-1">{chat.lastMsg}</p>
                      <span className="text-[9px] font-bold text-primary-600 uppercase tracking-[0.15em]">{chat.role}</span>
                   </div>
                   {chat.unread > 0 && (
                      <div className="ml-2 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-primary-200">
                         {chat.unread}
                      </div>
                   )}
                </button>
             ))}
          </div>
        </div>

        <div className={cn("flex-1 flex flex-col relative", !selectedChat ? "hidden lg:flex" : "flex")}>
          {selectedChat ? (
            <>
              <div className="p-6 border-b border-slate-50 flex items-center justify-between shrink-0 bg-white/80 backdrop-blur-md">
                 <div className="flex items-center gap-4">
                    <button onClick={() => setSelectedChat(null)} className="lg:hidden p-2 text-slate-400 hover:text-slate-900 transition-colors">
                       <ChevronLeft size={24} />
                    </button>
                    <div className="relative">
                       <img src={conversations.find(c => c.id === selectedChat)?.img} className="w-11 h-11 rounded-2xl object-cover" alt="" />
                       <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                    </div>
                    <div>
                       <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 dark:text-white">
                          {conversations.find(c => c.id === selectedChat)?.name}
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-primary-50 text-primary-600 rounded-md uppercase tracking-widest">{conversations.find(c => c.id === selectedChat)?.role}</span>
                       </h3>
                    </div>
                 </div>
                 <div className="flex items-center gap-1.5">
                    <button className="p-2.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"><Phone size={20} /></button>
                    <button className="p-2.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"><Video size={20} /></button>
                    <button className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"><MoreVertical size={20} /></button>
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide bg-slate-50/30">
                 {(messages[selectedChat] || []).map((msg) => (
                    <div key={msg.id} className={cn("flex flex-col max-w-[75%]", msg.type === 'sent' ? "ml-auto items-end" : "items-start")}>
                       <div className={cn("px-5 py-4 rounded-3xl text-sm font-medium leading-relaxed shadow-sm transition-all", msg.type === 'sent' ? "bg-slate-900 text-white rounded-tr-none" : "bg-white text-slate-700 border border-slate-100 rounded-tl-none")}>
                          {msg.text}
                       </div>
                       <div className="flex items-center gap-1.5 mt-2 px-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{msg.time}</span>
                          {msg.type === 'sent' && <CheckCheck size={12} className="text-primary-500" />}
                       </div>
                    </div>
                 ))}
              </div>

              <div className="p-6 border-t border-slate-50 bg-white shrink-0">
                 <form onSubmit={handleSendMessage} className="bg-slate-50 border border-slate-100 rounded-[2rem] p-2 pl-6 pr-2 flex items-center gap-4 focus-within:ring-4 focus-within:ring-primary-50 transition-all overflow-visible relative group">
                    <button type="button" className="text-slate-400 hover:text-primary-600 transition-colors"><Smile size={22} /></button>
                    <input 
                      type="text" 
                      value={inputText}
                      onChange={e => setInputText(e.target.value)}
                      placeholder="Type your message here..." 
                      className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-900 h-10"
                    />
                    <div className="flex items-center gap-1">
                       <button type="button" className="p-2.5 text-slate-400 hover:text-primary-600 hover:bg-white rounded-full transition-all"><Paperclip size={20} /></button>
                       <button type="button" className="p-2.5 text-slate-400 hover:text-primary-600 hover:bg-white rounded-full transition-all"><ImageIcon size={20} /></button>
                       <button type="submit" disabled={!inputText.trim()} className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-primary-200 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-90 transition-all ml-1">
                          <Send size={18} />
                       </button>
                    </div>
                 </form>
                 
                 <div className="mt-4 flex flex-wrap gap-2">
                    {['Interview Invite', 'Follow-up', 'Offer Pending'].map(t => (
                       <button key={t} onClick={() => setInputText(t)} type="button" className="px-3 py-1 bg-slate-50 text-[9px] font-bold text-slate-500 uppercase tracking-widest rounded-full border border-slate-100 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-100 transition-all">
                          {t}
                       </button>
                    ))}
                 </div>
              </div>
            </>
          ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-slate-50/30">
                <div className="w-24 h-24 bg-white rounded-[2rem] border border-slate-100 flex items-center justify-center text-primary-600 shadow-xl mb-8">
                   <MessageSquare size={48} />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 mb-2 dark:text-white">Select a Conversation</h3>
                <p className="text-slate-500 font-medium max-w-sm mb-10">Choose a candidate or team member from the sidebar to start corresponding.</p>
                <button className="px-8 py-3.5 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-lg active:scale-95 flex items-center gap-2">
                   <SquarePen size={18} />
                   <span>Start a New Thread</span>
                </button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
