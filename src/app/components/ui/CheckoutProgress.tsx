import styles from "./CheckoutProgress.module.scss";

const STEPS = [
  { key: "cart", label: "Carrinho" },
  { key: "customer-data", label: "Dados" },
  { key: "payment", label: "Pagamento" },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

export function CheckoutProgress({ current }: { current: StepKey }) {
  const currentIndex = STEPS.findIndex((step) => step.key === current);

  return (
    <ol className={styles.progress}>
      {STEPS.map((step, index) => (
        <li
          key={step.key}
          className={[
            styles.step,
            index === currentIndex ? styles.active : "",
            index < currentIndex ? styles.completed : "",
          ].join(" ")}
        >
          <span className={styles.dot}>{index + 1}</span>
          <span>{step.label}</span>
        </li>
      ))}
    </ol>
  );
}