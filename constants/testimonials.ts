// testimonials.ts

export interface Testimonial {
    quote: string;
    author: string;
    title: string;
  }
  
  export const signinTestimonials: Testimonial[] = [
    {
      quote: "Search and find your dream job is now easier than ever. Just browse a job and apply if you need to.",
      author: "Mas Parjono",
      title: "UI Designer at Google"
    },
    {
      quote: "This platform revolutionized my job search. I found my ideal position within weeks!",
      author: "Sarah Johnson",
      title: "Software Engineer at Amazon"
    },
    {
      quote: "The user-friendly interface and powerful search tools make job hunting a breeze.",
      author: "Alex Chen",
      title: "Data Analyst at Microsoft"
    }
  ];
  
  export const signupTestimonials: Testimonial[] = [
    {
      quote: "Joining this platform was the best career move I've made. It's not just about finding a job, it's about finding the right fit.",
      author: "Emily Rodriguez",
      title: "Marketing Specialist at Netflix"
    },
    {
      quote: "The sign-up process was smooth, and within days I was connecting with top companies in my field.",
      author: "Michael Chang",
      title: "Product Manager at Airbnb"
    },
    {
      quote: "I appreciate how this platform values both candidates and companies. It's created a respectful and efficient job search experience.",
      author: "Aisha Patel",
      title: "UX Designer at Spotify"
    }
  ];