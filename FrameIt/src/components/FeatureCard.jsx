function FeatureCard({ title, description, icon }) {
    return (
      <div className="bg-white rounded-lg px-6 py-2 shadow-sm mb-3">
        <div className="flex items-center mb-2"> {/* Make this div a flex container and vertically align items */}
          {icon}
          <div className="flex flex-col">
            <h3 className="text-lg text-center font-semibold ml-2">{title}</h3>
            <p className="pl-8 text-gray-500 text-sm">{description}</p>
          </div>
        </div>
        
      </div>
    );
  }
  
  export default FeatureCard;