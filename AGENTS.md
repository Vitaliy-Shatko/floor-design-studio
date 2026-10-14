<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Landing stays on the index route with in-page anchors; the product list lives on /catalog with static demo data in src/lib/catalog.ts until a database is added.
- Define visual tokens and reusable landing styles in src/styles.css, using the shared Button and Input controls for consistent presentation.
- Keep lead collection frontend-only until a real recipient is connected; never claim a request was sent when no delivery happened.
- Keep scroll and phone-validation rules in a browser-safe module with focused unit tests so interactions can be checked independently.
