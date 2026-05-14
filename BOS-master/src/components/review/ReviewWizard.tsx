import React, { useState } from 'react';
import { CheckCircle, HelpCircle } from 'lucide-react';

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
  const [currentStep, setCurrentStep] = useState(0);
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

  const steps = [
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

  const handleSubmit = () => {
    onSubmit(reviewData);
  };

  const renderStepContent = () => {
    const step = steps[currentStep];
    
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
        <h2 className="text-2xl font-bold text-gray-800">Review {schoolName}</h2>
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
            (steps[currentStep].field && 
            reviewData[steps[currentStep].field as keyof ReviewData] === 0) 
              ? 'opacity-50 cursor-not-allowed' 
              : ''
          }`}
          disabled={
            steps[currentStep].field &&
            reviewData[steps[currentStep].field as keyof ReviewData] === 0
          }
        >
          {currentStep === steps.length - 1 ? 'Submit Review' : 'Next Step'}
        </button>
      </div>
    </div>
  );
};

export default ReviewWizard;