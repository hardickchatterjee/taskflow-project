export const api = {
  suggestSubtasks: {
    useMutation: () => ({
      mutate: async () => {
        // Mock AI response
        return [
          "Research requirements",
          "Design UI mockup",
          "Set up project repo",
          "Write initial components"
        ];
      }
    })
  },
  useUtils: () => ({})
};
