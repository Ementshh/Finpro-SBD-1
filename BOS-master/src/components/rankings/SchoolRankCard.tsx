import React from 'react';
import { Link } from 'react-router-dom';
import { Star, TrendingUp, TrendingDown, Minus, School } from 'lucide-react';

interface SchoolRankCardProps {
  rank: number;
  id: string;
  name: string;
  rating: number;
  transparencyScore: number;
  fundEfficiency: number;
  parentSatisfaction: number;
  previousRank: number;
  image?: string;
}

const SchoolRankCard: React.FC<SchoolRankCardProps> = ({
  rank,
  id,
  name,
  rating,
  transparencyScore,
  fundEfficiency,
  parentSatisfaction,
  previousRank,
  image,
}) => {

  const rankChange = (!previousRank || previousRank === 0) ? 0 : previousRank - rank;
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:transform hover:scale-[1.02]">
      <div className={`relative h-32 bg-gradient-to-r ${
        rank <= 3 ? 'from-blue-600 to-blue-400' : 'from-gray-600 to-gray-400'
      }`}>
        {image ? (
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-cover opacity-30" 
          />
        ) : null}
        <div className="absolute inset-0 flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              rank === 1 ? 'bg-yellow-400' : 
              rank === 2 ? 'bg-gray-300' : 
              rank === 3 ? 'bg-yellow-700' : 'bg-white'
            } text-gray-900 font-bold`}>
              {rank}
            </div>
            <div className="text-white">
              <h3 className="font-bold">{name}</h3>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm">{rating.toFixed(1)}</span>
              </div>
            </div>
          </div>
          {rankChange !== 0 && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-white bg-opacity-20 backdrop-blur-sm rounded-md">
              {rankChange > 0 ? (
                <>
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-white">+{rankChange}</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-4 w-4 text-red-400" />
                  <span className="text-sm text-white">{rankChange}</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-xs text-gray-500">Transparency</p>
            <div className="mt-1 relative pt-1">
              <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                <div
                  style={{ width: `${Math.min(transparencyScore, 100)}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                ></div>
              </div>
              <p className="text-sm font-medium">{Number(transparencyScore).toFixed(2)}%</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Fund Efficiency</p>
            <div className="mt-1 relative pt-1">
              <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                <div
                  style={{ width: `${Math.min(fundEfficiency, 100)}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-teal-500"
                ></div>
              </div>
              <p className="text-sm font-medium">{Number(fundEfficiency).toFixed(2)}%</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Parent Satisfaction</p>
            <div className="mt-1 relative pt-1">
              <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                <div
                  style={{ width: `${Math.min(parentSatisfaction, 100)}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-orange-500"
                ></div>
              </div>
              <p className="text-sm font-medium">{Number(parentSatisfaction).toFixed(2)}%</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between mt-4">
          <Link
            to={`/school/${id}`}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100"
          >
            <School className="w-4 h-4 mr-1" />
            View Details
          </Link>
          <Link
            to={`/review/${id}`}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-teal-700 bg-teal-50 hover:bg-teal-100"
          >
            <Star className="w-4 h-4 mr-1" />
            Review School
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SchoolRankCard;