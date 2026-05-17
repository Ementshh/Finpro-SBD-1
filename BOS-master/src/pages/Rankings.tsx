import React, { useState, useEffect } from 'react';
import SchoolRankCard from '../components/rankings/SchoolRankCard';
import { BarChart3, Filter, TrendingUp } from 'lucide-react';
import { API_URL } from '../config/api';

const Rankings: React.FC = () => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    level: 'all',
    location: 'all',
    sortBy: 'rating',
  });

  const [schools, setSchools] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const res = await fetch(`${API_URL}/schools`);
        const data = await res.json();
        
        let sortedData = data;
        sortedData = [...data].sort((a: any, b: any) => {
          return parseFloat(b.average_rating || 0) - parseFloat(a.average_rating || 0);
        });

        const mappedData = sortedData.map((s: any, index: number) => {
          const rating = parseFloat(s.average_rating) || 0;
          const fundUsage = parseFloat(s.fund_usage_percentage) || 0;
          const allocation = parseFloat(s.fund_allocation) || 0;
          
          const calculatedSatisfaction = rating * 20;

          let calculatedTransparency = 0;
          
          if (s.npsn) calculatedTransparency += 10;
          if (parseInt(s.total_students) > 0) calculatedTransparency += 10;
          if (s.accreditation && s.accreditation !== 'null') calculatedTransparency += 10;

          if (allocation > 0) calculatedTransparency += 20; 
          if (fundUsage > 0) calculatedTransparency += 20; 

          if (fundUsage > 0 && fundUsage <= 100) {
            calculatedTransparency += 30;
          } else if (fundUsage > 100 && fundUsage <= 150) {
            calculatedTransparency += 15;
          } else if (fundUsage > 150) {
            calculatedTransparency += 0; 
          } else if (allocation > 0 && fundUsage === 0) {
            calculatedTransparency += 5; 
          }
          
          return {
            id: s.id.toString(),
            name: s.name,
            level: s.education_level || 'Unknown',
            location: s.region || 'Unknown',
            rating: rating,
            transparencyScore: s.transparency_score ? parseFloat(s.transparency_score) : calculatedTransparency,
            fundEfficiency: fundUsage, 
            parentSatisfaction: s.parent_satisfaction ? parseFloat(s.parent_satisfaction) : calculatedSatisfaction,
            previousRank: s.previous_rank ? parseInt(s.previous_rank) : 0,
            image: s.image_url || [
              'https://images.pexels.com/photos/256395/pexels-photo-256395.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
              'https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
              'https://images.pexels.com/photos/2982449/pexels-photo-2982449.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
            ][index % 3],
          };
        });
        setSchools(mappedData);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSchools();
  }, []);

  const filteredSchools = schools
    .filter((school) => {
      if (selectedFilters.level !== 'all' && school.level !== selectedFilters.level) {
        return false;
      }
      if (selectedFilters.location !== 'all' && school.location !== selectedFilters.location) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (selectedFilters.sortBy === 'rating') {
        return b.rating - a.rating;
      } else if (selectedFilters.sortBy === 'transparency') {
        return b.transparencyScore - a.transparencyScore;
      } else if (selectedFilters.sortBy === 'efficiency') {
        return b.fundEfficiency - a.fundEfficiency;
      } else if (selectedFilters.sortBy === 'satisfaction') {
        return b.parentSatisfaction - a.parentSatisfaction;
      }
      return 0;
    });

  const toggleFilters = () => {
    setFilterOpen(!filterOpen);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSelectedFilters({
      ...selectedFilters,
      [name]: value,
    });
  };

  if (isLoading) {
    return <div className="p-8 text-center bg-white rounded-lg mt-6">Loading rankings data...</div>;
  }

  return (
    <div className="container mx-auto px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">School Rankings</h1>
        <p className="text-gray-600">
          Schools ranked by transparency, fund efficiency, and parent satisfaction
        </p>
      </div>
      
      <div className="flex flex-wrap items-center justify-between mb-6">
        <div className="flex space-x-2 mb-4 sm:mb-0">
          <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
            <BarChart3 className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">2023/2024 Rankings</span>
          </div>
          <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">Updated: May 15, 2025</span>
          </div>
        </div>
        
        <button
          onClick={toggleFilters}
          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <Filter className="w-4 h-4 mr-1" />
          {filterOpen ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>
      
      {filterOpen && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
                School Level
              </label>
              <select
                id="level"
                name="level"
                value={selectedFilters.level}
                onChange={handleFilterChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">All Levels</option>
                <option value="Elementary">Elementary</option>
                <option value="Junior High">Junior High</option>
                <option value="Senior High">Senior High</option>
                <option value="Vocational High">Vocational High</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <select
                id="location"
                name="location"
                value={selectedFilters.location}
                onChange={handleFilterChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">All Locations</option>
                <option value="Jakarta Pusat">Jakarta</option>
                <option value="Bandung">Bandung</option>
                <option value="Surabaya">Surabaya</option>
                <option value="Yogyakarta">Yogyakarta</option>
                <option value="Semarang">Semarang</option>
                <option value="Makassar">Makassar</option>
                <option value="Medan">Medan</option>
                <option value="Bali">Bali</option>
                <option value="Palembang">Palembang</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                id="sortBy"
                name="sortBy"
                value={selectedFilters.sortBy}
                onChange={handleFilterChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="rating">Overall Rating</option>
                <option value="transparency">Transparency Score</option>
                <option value="efficiency">Fund Efficiency</option>
                <option value="satisfaction">Parent Satisfaction</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setSelectedFilters({ level: 'all', location: 'all', sortBy: 'rating' })}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSchools.map((school, index) => (
          <SchoolRankCard
            key={school.id}
            rank={index + 1}
            id={school.id}
            name={school.name}
            rating={school.rating}
            transparencyScore={school.transparencyScore}
            fundEfficiency={school.fundEfficiency}
            parentSatisfaction={school.parentSatisfaction}
            previousRank={school.previousRank}
            image={school.image}
          />
        ))}
      </div>
      
      <div className="flex justify-center mt-8">
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
          Load More Schools
        </button>
      </div>
    </div>
  );
};

export default Rankings;