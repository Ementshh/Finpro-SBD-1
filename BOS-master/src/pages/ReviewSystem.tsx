import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReviewWizard, { ReviewData } from '../components/review/ReviewWizard';
import { CheckCircle } from 'lucide-react';

const ReviewSystem: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Mock data 
  const schoolData = {
    id: id || 'new',
    name: id === '1' ? 'SD Negeri 1 Jakarta' :
          id === '2' ? 'SMP Negeri 3 Surabaya' :
          id === '3' ? 'SMA Negeri 2 Bandung' :
          id === '4' ? 'SD Negeri 5 Semarang' :
          id === '5' ? 'SMK Negeri 1 Yogyakarta' :
          id === '6' ? 'SD Negeri 2 Medan' :
          id === '7' ? 'SMP Negeri 1 Makassar' :
          'Select a School',
  };
  
  const handleReviewSubmit = (data: ReviewData) => {
    console.log('Review submitted:', data);
    setIsSubmitted(true);

    const targetSchoolId = data.schoolId && data.schoolId !== 'new' ? data.schoolId : id;
    setTimeout(() => {
      if (targetSchoolId) {
        navigate(`/school/${targetSchoolId}`);
      } else {
        navigate('/');
      }
    }, 3000);
  };

  if (isSubmitted) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Thank You for Your Review!</h2>
          <p className="text-gray-600 mb-6">
            Your feedback helps improve transparency and accountability in the education system.
          </p>
          <p className="text-sm text-gray-500">
            You will be redirected to the school page shortly...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="mb-8">
        <ReviewWizard 
          schoolId={id || 'new'} 
          schoolName={schoolData.name}
          onSubmit={handleReviewSubmit} 
        />
      </div>
    </div>
  );
};

export default ReviewSystem;