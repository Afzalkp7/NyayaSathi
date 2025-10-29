import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import WelcomeBanner from '../components/WelcomeBanner';
import ActionCard from '../components/ActionCard';
import CategoryCard from '../components/CategoryCard';
import {
    ChatBubbleIcon, BookOpenIcon, ClockIcon, EmergencyIcon,
    HomeIcon, HeartIcon, BriefcaseIcon, CarIcon, ShieldIcon,
    CartIcon, LightbulbIcon
} from '../components/icons';

interface HomePageProps {
    onOpenChat: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onOpenChat }) => {
    // This is the same data from your App.tsx
    const quickActions = [
        {
            icon: <ChatBubbleIcon className="w-6 h-6 text-blue-500" />,
            title: "Describe Issue",
            description: "Tell us your legal problem",
            color: "bg-blue-100",
            href: "/describe" // <-- Add a URL for navigation
        },
        {
            icon: <BookOpenIcon className="w-6 h-6 text-green-500" />,
            title: "Law Library",
            description: "Browse legal topics",
            color: "bg-green-100",
            href: "/library" // <-- Add a URL for navigation
        },
        // {
        //     icon: <ClockIcon className="w-6 h-6 text-orange-500" />,
        //     title: "Step Guide",
        //     description: "Know what to do next",
        //     color: "bg-orange-100"
        //     // We can add href: "/guide" later
        // },
        // {
        //     icon: <EmergencyIcon className="w-6 h-6 text-red-500" />,
        //     title: "Emergency",
        //     description: "Important helplines",
        //     color: "bg-red-100"
        //     // We can add href: "/emergency" later
        // }
    ];

    const popularCategories = [
        { icon: <HomeIcon className="w-6 h-6 text-purple-500" />, name: "Property", color: "bg-purple-100" },
        { icon: <HeartIcon className="w-6 h-6 text-pink-500" />, name: "Marriage", color: "bg-pink-100" },
        { icon: <BriefcaseIcon className="w-6 h-6 text-indigo-500" />, name: "Workplace", color: "bg-indigo-100" },
        { icon: <CarIcon className="w-6 h-6 text-yellow-500" />, name: "Traffic", color: "bg-yellow-100" },
        { icon: <ShieldIcon className="w-6 h-6 text-rose-500" />, name: "Cybercrime", color: "bg-rose-100" },
        { icon: <CartIcon className="w-6 h-6 text-emerald-500" />, name: "Consumer", color: "bg-emerald-100" },
    ];
    
    return (
        <div className="space-y-12">
            {/* "Get Help Now" button still opens the chat modal */}
            <WelcomeBanner onGetHelp={onOpenChat} />

            <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {quickActions.map(action => (
                        // If the action has an 'href', wrap it in a Link.
                        // Otherwise, use the onClick for the chat modal.
                        action.href ? (
                            <Link to={action.href} key={action.title}>
                                <ActionCard {...action} />
                            </Link>
                        ) : (
                            <ActionCard 
                                key={action.title} 
                                {...action} 
                                // This makes your "Describe Issue" button (which now navigates)
                                // and your "Get Help Now" button (which opens chat) work differently.
                                // BUT wait, your prompt says "Describe Issue" should go to a new page.
                                // The code above handles this.
                                // Let's fix the "Describe Issue" onClick from your original file.
                                // We'll make it so only "Get Help Now" opens the chat.
                                // ...Ah, wait. Your original App.tsx has "Describe Issue" opening the chat.
                                // Your *new* request is to change this.
                                // This code correctly separates them:
                                // "Get Help Now" uses onOpenChat.
                                // "Describe Issue" uses <Link to="/describe">.
                                // This is what you want!
                            />
                        )
                    ))}
                    {/* A cleaner way to handle the actions: */}
                    {/* <Link to="/describe">
                        <ActionCard {...quickActions[0]} />
                    </Link>
                    <Link to="/library">
                        <ActionCard {...quickActions[1]} />
                    </Link>
                    <ActionCard {...quickActions[2]} />
                    <ActionCard {...quickActions[3]} />
                    */}
                </div>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Popular Categories</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
                    {popularCategories.map(cat => <CategoryCard key={cat.name} {...cat} />)}
                </div>
            </section>
            
            <div className="bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded-r-lg flex items-start space-x-3">
                <LightbulbIcon className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                <div>
                     <p className="font-bold">Quick Tip</p>
                     <p>Always keep documents ready when seeking legal advice. Screenshots and records can be crucial evidence.</p>
                </div>
            </div>
        </div>
    );
};

export default HomePage;