import { motion } from 'framer-motion';

interface BookingProgressProps {
  currentStep: number;
  totalSteps: number;
}

const BookingProgress = ({ currentStep, totalSteps }: BookingProgressProps) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full h-1 bg-muted">
      <motion.div
        className="h-full bg-airbnb-primary"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      />
    </div>
  );
};

export default BookingProgress;
