import { useState } from 'react';
import styles from "./Reviews.module.css";
import { IconButton } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const reviewsData = [
  {
    name: "David M.",
    role: "Software Engineer",
    content: "Resume8 revolutionized my job search...",
    avatar: "/Dashboard/Reviews/1.jpg"
  },
  {
    name: "Jennifer K.",
    role: "Marketing Professional",
    content: "The resume optimization feature is incredible...",
    avatar: "/Dashboard/Reviews/8.jpg"
  },
  {
    name: "Michael P.",
    role: "Data Scientist",
    content: "What impressed me most was the intelligent job matching...",
    avatar: "/Dashboard/Reviews/2.jpg"
  },
  {
    name: "Sarah L.",
    role: "Product Manager",
    content: "Thanks to Resume8, I could focus on preparing...",
    avatar: "/Dashboard/Reviews/7.jpg"
  }
];

const Reviews = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? reviewsData.length - 2 : prev - 2));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= reviewsData.length - 2 ? 0 : prev + 2));
  };

  return (
    <section className={styles.reviewsContainer}>
      <h2 className={styles.title}>Join our empowered writers at Genius Drafts</h2>
      <p className={styles.subtitle}>
        We helped write over 970 million words. From academic essays, journals, to top-ranking thesis
      </p>
      
      <div className={styles.carouselContainer}>
        <IconButton 
          onClick={handlePrev}
          className={styles.arrowButton}
          sx={{
            '&:hover': {
              backgroundColor: 'rgba(67, 56, 202, 0.1)',
            }
          }}
        >
          <ArrowBackIosNewIcon />
        </IconButton>

        <div className={styles.reviewsWrapper}>
          {reviewsData.slice(currentIndex, currentIndex + 2).map((review, index) => (
            <div key={index} className={styles.reviewCard}>
              <div className={styles.reviewHeader}>
                <img 
                  src={review.avatar} 
                  alt={`${review.name} avatar`}
                  className={styles.avatar}
                />
                <div className={styles.reviewerInfo}>
                  <h3>{review.name}</h3>
                  <p>{review.role}</p>
                </div>
              </div>
              <p className={styles.reviewContent}>{review.content}</p>
            </div>
          ))}
        </div>

        <IconButton 
          onClick={handleNext}
          className={styles.arrowButton}
          sx={{
            '&:hover': {
              backgroundColor: 'rgba(67, 56, 202, 0.1)',
            }
          }}
        >
          <ArrowForwardIosIcon />
        </IconButton>
      </div>
    </section>
  );
};

export default Reviews;