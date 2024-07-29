export const getInitials = (firstName: string | null, lastName: string | null): string => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`;
    } else if (firstName) {
      return firstName[0];
    } else if (lastName) {
      return lastName[0];
    }
    return 'U';
  };