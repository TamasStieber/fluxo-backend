export const welcomeMessageContent =
  'Hey there! Thanks for checking out Fluxo! Feel free to look around!';

export const removeDiacritics = (string: string) => {
  return string.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};
