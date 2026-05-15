const themeScript = `
try {
  var root = document.documentElement;
  var theme = localStorage.getItem("theme");
  if (theme !== "dark" && theme !== "light") theme = "light";
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  root.style.colorScheme = theme;
} catch (_) {}
`;

export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: themeScript,
      }}
    />
  );
}
