document.addEventListener("DOMContentLoaded", async () => {
  const counter = document.querySelector(".preloader-counter");
  const counterValue = document.querySelector(".preloader-value");
  const texts = ".hero-header h1, .header a, .hero-footer p";

  if (!counter || !counterValue) return;

  // Центрируем в процентах: иначе GSAP переведёт CSS translate(-50%)
  // в пиксели, и после ресайза картинка съедет
  gsap.set(".hero-bg img", { x: 0, y: 0, xPercent: -50, yPercent: -50 });

  // Без анимаций сразу показываем конечное состояние
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    counter.remove();
    gsap.set(".hero-bg", { clipPath: "none" });
    gsap.set(".hero-bg img", { scale: 1 });
    gsap.set([".progress-bar", ".progress"], { scaleX: 1 });
    gsap.set(texts, { visibility: "visible" });
    return;
  }

  // Буквы разбиваем только после загрузки собственного шрифта
  await document.fonts.ready;

  // SplitText регистрируется сам
  gsap.registerPlugin(CustomEase);
  CustomEase.create("hop", "0.9, 0, 0.1, 1");

  const split = (target, type) =>
    SplitText.create(target, { type, mask: type });

  const { chars: titleChars } = split(".hero-header h1", "chars");
  const { words: navWords } = split(".header a", "words");
  const { words: footerWords } = split(".hero-footer p", "words");

  gsap.set(titleChars, { xPercent: 100 });
  gsap.set([...navWords, ...footerWords], { yPercent: 100 });
  gsap.set(texts, { visibility: "visible" });

  const count = { value: 0 };
  const tl = gsap.timeline();

  tl.to(count, {
    value: 100,
    duration: 3,
    ease: "power3.out",
    onUpdate: () => {
      counterValue.textContent = `${Math.floor(count.value)}%`;
    },
    onComplete: () => {
      const { chars } = split(counterValue, "chars");

      gsap.to(chars, {
        xPercent: -100,
        stagger: 0.1,
        duration: 0.75,
        ease: "power3.out",
        delay: 1,
        onComplete: () => counter.remove(),
      });
    },
  })
    .to(counter, { scale: 1, duration: 3, ease: "power3.out" }, "<")
    .to(".progress-bar", { scaleX: 1, duration: 3, ease: "power3.out" }, "<")
    .to(
      ".hero-bg",
      {
        clipPath: "polygon(35% 35%, 65% 35%, 65% 65%, 35% 65%)",
        duration: 1.5,
        ease: "hop",
      },
      4.5,
    )
    .to(".hero-bg img", { scale: 1.5, duration: 1.5, ease: "hop" }, "<")
    .to(
      ".hero-bg",
      {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        duration: 2,
        ease: "hop",
      },
      6,
    )
    .to(".hero-bg img", { scale: 1, duration: 2, ease: "hop" }, 6)
    .to(".progress", { scaleX: 1, duration: 3, ease: "power3.out" }, 6)
    .to(
      titleChars,
      { xPercent: 0, duration: 1, ease: "power4.out", stagger: 0.075 },
      7,
    )
    .to(
      [...navWords, ...footerWords],
      { yPercent: 0, duration: 1, ease: "power4.out", stagger: 0.075 },
      7.5,
    );
});
