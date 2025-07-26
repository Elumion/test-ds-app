if (!customElements.get("order-list")) {
  customElements.define(
    "order-list",
    class SectionOrderList extends HTMLElement {
      constructor() {
        super();
      }

      connectedCallback() {
        this.downloadLink = this.querySelector(".orders-list__download-link");
        this.addEventListener("click", this.handleClick);
      }

      handleClick = (event) => {
        const target = event.target;

        if (target.closest(".orders-list__order-label")) {
          const url = new URL(this.downloadLink.getAttribute("href"));
          const checkboxes = this.querySelectorAll(
            ".orders-list__order-checkbox",
          );
          const ordersIds = [...checkboxes]
            ?.filter((el) => el.checked)
            ?.map((el) => el.dataset.id)
            .join(",");

          url.searchParams.set("shop", this.dataset.shop);
          url.searchParams.set("ordersIds", ordersIds);
          this.downloadLink.setAttribute("href", url.toString());
        }
      };
    },
  );
}
