import { motion } from 'framer-motion';

const StatusToggle = ({ isFree, onToggle }) => {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Availability</h3>
          <p className="text-sm text-slate-500">
            {isFree ? "You are visible to people nearby" : "Set to 'Free' to start chatting"}
          </p>
        </div>
        <button 
          onClick={onToggle}
          className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${isFree ? 'bg-green-500' : 'bg-slate-300'}`}
        >
          <motion.div 
            animate={{ x: isFree ? 34 : 4 }}
            className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
          />
        </button>
      </div>

      {isFree && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 pt-4 border-t border-slate-50"
        >
          <input 
            type="text" 
            placeholder="What are you up for? (e.g., Coffee, Walk...)" 
            className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </motion.div>
      )}
    </div>
  );
};

export default StatusToggle;