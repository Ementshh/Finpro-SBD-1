import React, { useState, useEffect } from 'react';
import { CheckCircle, HelpCircle, Search } from 'lucide-react';
import { API_URL } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';

interface ReviewWizardProps {
  schoolId: string;
  schoolName: string;
  onSubmit: (data: ReviewData) => void;
}

export interface ReviewData {
  schoolId: string;
  fundUtilization: number;
  feeTransparency: number;
  facilityMaintenance: number;
  academicResources: number;
  extracurricularFunding: number;
  comments: string;
  isAnonymous: boolean;
}

const ReviewWizard: React.FC<ReviewWizardProps> = ({ schoolId, schoolName, onSubmit }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [schools, setSchools] = useState<{id: string, name: string}[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<{id: string, name: string}[]>([]);
  const [searchQuery, setSearchQuery] = useState(schoolName === 'Select a School' ? '' : schoolName);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedSchoolName, setSelectedSchoolName] = useState(schoolName);

  const [reviewData, setReviewData] = useState<ReviewData>({
    schoolId,
    fundUtilization: 0,
    feeTransparency: 0,
    facilityMaintenance: 0,
    academicResources: 0,
    extracurricularFunding: 0,
    comments: '',
    isAnonymous: false,
  });

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const res = await fetch(`${API_URL}/schools`);
        if (res.ok) {
          const data = await res.json();
          const mappedSchools = data.map((s: any) => ({
            id: s.id.toString(),
            name: s.name
          }));
          setSchools(mappedSchools);
          setFilteredSchools(mappedSchools);
        }
      } catch (err) {
        console.error('Error fetching schools', err);
      }
    };
    fetchSchools();
  }, []);

  const steps = [
    {
      title: 'Select School',
      description: 'Find and select the school you want to review',
      isSchoolSelection: true,
    },
    {
      title: 'Fund Utilization',
      description: 'How well does the school utilize BOS funds?',
      field: 'fundUtilization' as keyof ReviewData,
      help: 'Consider if funds are used effectively for intended educational purposes',
    },
    {
      title: 'Fee Transparency',
      description: 'How transparent is the school about fees and costs?',
      field: 'feeTransparency' as keyof ReviewData,
      help: 'Consider if all fees are clearly communicated and justified',
    },
    {
      title: 'Facility Maintenance',
      description: 'How well-maintained are the school facilities?',
      field: 'facilityMaintenance' as keyof ReviewData,
      help: 'Consider classrooms, bathrooms, playgrounds, labs, and other facilities',
    },
    {
      title: 'Academic Resources',
      description: 'How adequate are the academic resources provided?',
      field: 'academicResources' as keyof ReviewData,
      help: 'Consider textbooks, learning materials, and classroom equipment',
    },
    {
      title: 'Extracurricular Funding',
      description: 'How well-funded are extracurricular activities?',
      field: 'extracurricularFunding' as keyof ReviewData,
      help: 'Consider sports, arts, clubs, and other non-academic activities',
    },
    {
      title: 'Additional Comments',
      description: 'Share any additional feedback or observations',
      isTextArea: true,
    },
  ];

  const handleRatingChange = (value: number) => {
    const currentField = steps[currentStep].field;
    if (currentField) {
      setReviewData({
        ...reviewData,
        [currentField]: value,
      });
    }
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReviewData({
      ...reviewData,
      comments: e.target.value,
    });
  };

  const handleAnonymousChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReviewData({
      ...reviewData,
      isAnonymous: e.target.checked,
    });
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const averageScore = Math.round(
        (reviewData.fundUtilization + reviewData.feeTransparency + reviewData.facilityMaintenance + reviewData.academicResources + reviewData.extracurricularFunding) / 5
      );

      const resolvedUserId = reviewData.isAnonymous ? null : user?.id ? Number(user.id) : null;
      if (!reviewData.isAnonymous && (resolvedUserId === null || Number.isNaN(resolvedUserId))) {
        throw new Error('You must be logged in to submit a non-anonymous review');
      }
      
      const res = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          school_id: reviewData.schoolId,
          user_id: resolvedUserId,
          score: averageScore,
          comments: reviewData.comments
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit review');
      }

      onSubmit(reviewData);
    } catch (err) {
      console.error(err);
      alert('Error submitting review to backend!');
    }
  };

  const renderStepContent = () => {
    const step = steps[currentStep];
    
    if ('isSchoolSelection' in step && step.isSchoolSelection) {
      return (
        <div className="mt-8">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search for a School</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="w-full pl-10 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Type school name to search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                  if (e.target.value.trim() === '') {
                    setFilteredSchools(schools);
                  } else {
                    setFilteredSchools(
                      schools.filter((s) => s.name.toLowerCase().includes(e.target.value.toLowerCase()))
                    );
                  }
                }}
                onFocus={() => setIsDropdownOpen(true)}
              />
              {isDropdownOpen && filteredSchools.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredSchools.map((s) => (
                    <li
                      key={s.id}
                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setReviewData({ ...reviewData, schoolId: s.id });
                        setSelectedSchoolName(s.name);
                        setSearchQuery(s.name);
                        setIsDropdownOpen(false);
                      }}
                    >
                      {s.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          {reviewData.schoolId && reviewData.schoolId !== 'new' && (
            <div className="mt-6 p-4 bg-green-50 text-green-800 rounded-md flex items-center border border-green-200">
              <CheckCircle className="w-5 h-5 mr-3 text-green-600" />
              <div>
                <p className="text-sm text-green-600 font-medium">Selected School</p>
                <p className="text-lg font-semibold">{selectedSchoolName}</p>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (step.isTextArea) {
      return (
        <div className="mt-6">
          <textarea
            rows={6}
            placeholder="Share your thoughts, suggestions, or concerns about the school's financial management and resource allocation..."
            className="w-full p-3 border border-gray-300 rounded-md"
            value={reviewData.comments}
            onChange={handleCommentChange}
          ></textarea>
          
          <div className="mt-4 flex items-center">
            <input
              type="checkbox"
              id="anonymous"
              checked={reviewData.isAnonymous}
              onChange={handleAnonymousChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="anonymous" className="ml-2 text-sm text-gray-700">
              Submit this review anonymously
            </label>
          </div>
        </div>
      );
    }
    
    return (
      <div className="mt-8">
        <div className="relative">
          <div className="flex justify-between mb-6">
            {[1, 2, 3, 4, 5].map((num) => (
              <div key={num} className="flex flex-col items-center">
                <button
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                    reviewData[step.field as keyof ReviewData] === num
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => handleRatingChange(num)}
                >
                  {num}
                </button>
                <span className="mt-2 text-xs text-gray-600">
                  {num === 1 ? 'Poor' : 
                   num === 2 ? 'Fair' : 
                   num === 3 ? 'Good' : 
                   num === 4 ? 'Very Good' : 'Excellent'}
                </span>
              </div>
            ))}
          </div>
          
          <div className="absolute -bottom-6 w-full h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${((reviewData[step.field as keyof ReviewData] as number) / 5) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <div className="mt-10 flex items-start">
          <HelpCircle className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600">{step.help}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Review {selectedSchoolName === 'Select a School' ? 'a School' : selectedSchoolName}</h2>
        <p className="text-gray-600 mt-1">
          Help improve transparency by sharing your experience
        </p>
      </div>
      
      {/* Progress bar */}
      <div className="relative mb-8">
        <div className="w-full h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          ></div>
        </div>
        <div className="mt-2 flex justify-between text-xs text-gray-500">
          <span>Start</span>
          <span>Complete</span>
        </div>
      </div>
      
      {/* Step indicators */}
      <div className="hidden sm:flex justify-between mb-8">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`flex flex-col items-center ${
              index <= currentStep ? 'text-blue-600' : 'text-gray-400'
            }`}
            style={{ width: `${100 / steps.length}%` }}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              index < currentStep
                ? 'bg-blue-600 text-white'
                : index === currentStep
                ? 'border-2 border-blue-600 text-blue-600'
                : 'border-2 border-gray-300'
            }`}>
              {index < currentStep ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                index + 1
              )}
            </div>
            <span className="mt-2 text-xs text-center font-medium">{step.title}</span>
          </div>
        ))}
      </div>
      
      {/* Current step */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800">{steps[currentStep].title}</h3>
        <p className="text-gray-600 mt-1">{steps[currentStep].description}</p>
      </div>
      
      {/* Step content */}
      {renderStepContent()}
      
      {/* Navigation buttons */}
      <div className="mt-12 flex justify-between">
        <button
          onClick={prevStep}
          className={`px-4 py-2 rounded-md ${
            currentStep === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          disabled={currentStep === 0}
        >
          Back
        </button>
        <button
          onClick={nextStep}
          className={`px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 ${
            ((steps[currentStep].field && reviewData[steps[currentStep].field as keyof ReviewData] === 0) ||
            ('isSchoolSelection' in steps[currentStep] && (!reviewData.schoolId || reviewData.schoolId === 'new')))
              ? 'opacity-50 cursor-not-allowed' 
              : ''
          }`}
          disabled={
            (steps[currentStep].field && reviewData[steps[currentStep].field as keyof ReviewData] === 0) ||
            ('isSchoolSelection' in steps[currentStep] && (!reviewData.schoolId || reviewData.schoolId === 'new'))
          }
        >
          {currentStep === steps.length - 1 ? 'Submit Review' : 'Next Step'}
        </button>
      </div>
    </div>
  );
};

export default ReviewWizard;