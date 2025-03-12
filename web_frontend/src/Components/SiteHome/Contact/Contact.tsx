import styles from './Contact.module.css';
import { Button, TextField } from '@mui/material';
import { useState, useRef } from 'react';
const Contact = () => {
  const form = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Clear form fields
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: ''
      });
    } catch (error) {
      console.error('Error sending email:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.contactContainer} id='contact-section'>
      <div className={styles.contactContent}>
        <div className={styles.textContent}>
          <h2 className={styles.title}>
            Ready to get <span className={styles.highlight}>started</span>?
          </h2>
          <p className={styles.subtitle}>
            If you have any questions, we're here to help. Our team will get back to you shortly.
          </p>
        </div>

        <form ref={form} className={styles.formContainer} onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <TextField
              fullWidth
              variant="outlined"
              label="Your Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#bc1a1a',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#bc1a1a',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#bc1a1a',
                },
              }}
            />
            <TextField
              fullWidth
              variant="outlined"
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#bc1a1a',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#bc1a1a',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#bc1a1a',
                },
              }}
            />
          </div>
          <TextField
            fullWidth
            variant="outlined"
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            sx={{
              marginTop: '1rem',
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#bc1a1a',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#bc1a1a',
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#bc1a1a',
              },
            }}
          />
          <TextField
            fullWidth
            variant="outlined"
            label="What do you need help with"
            name="message"
            value={formData.message}
            onChange={handleChange}
            multiline
            rows={4}
            sx={{
              marginTop: '1rem',
              marginBottom: '1.5rem',
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#bc1a1a',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#bc1a1a',
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#bc1a1a',
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={isSubmitting}
            className={styles.submitButton}
            sx={{
              bgcolor: '#bc1a1a',
              color: 'white',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              fontSize: '1rem',
              fontWeight: '500',
              textTransform: 'none',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: '#bc1a1a',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(67, 56, 202, 0.3)',
              }
            }}
          >
            {isSubmitting ? 'Sending...' : 'Send Request'}
          </Button>
        </form>
      </div>
    </section>
  );
};

export default Contact;
    