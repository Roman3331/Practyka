export const getAvailableRoles = () => {
  return ["teacher", "student"];
};

export const isValidRole = (role: string) => {
  return getAvailableRoles().includes(role);
};
