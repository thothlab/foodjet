# FoodJet — Full Task Breakdown v2

**Проект:** Multi-store Telegram bot + Mini App для доставки товаров из магазинов  
**Версия:** v2  
**Назначение:** полный task breakdown для Claude Code / Codex / engineering lead / QA

**TelegramBot token:** 8384666408:AAGYmV0gynQ2uVhAgpoO0u2p7Bu7k0645z0

---

# 1. Как использовать этот документ

Документ предназначен для:
- декомпозиции проекта на независимые задачи;
- параллельной реализации несколькими исполнителями;
- снижения количества неявных решений и галлюцинаций;
- фиксации MVP-границ.

Каждая задача содержит:
- **ID**
- **Название**
- **Цель**
- **Контекст**
- **In Scope**
- **Out of Scope**
- **Артефакты / Deliverables**
- **Acceptance Criteria**
- **Dependencies**
- **Suggested Owner**
- **Notes / Edge Cases**

---

# 2. Ограничения MVP

## 2.1 Бизнес
- Один Telegram-бот для всех магазинов.
- Несколько магазинов внутри одной платформы.
- У каждого магазина свой deep link / start link.
- Клиентский интерфейс: Telegram Bot + Telegram Mini App.
- Оплата в MVP: **только наличными курьеру при доставке**.
- Зона доставки в MVP: **только текстовое описание районов / населенных пунктов**.
- Нет карт, геозон, радиусов, геофенсинга.
- Нет онлайн-платежей.
- Нет live tracking курьера.
- Нет автоназначения курьеров.
- Нет ERP/POS-интеграций.
- Нет бонусов, loyalty, cashback.

## 2.2 Технические
- Архитектура: **modular monolith**.
- Все бизнес-критичные проверки только на backend.
- Все изменения критичных сущностей пишутся в audit log.
- Telegram auth data валидируется на backend.
- Все API должны иметь единый error format.

---

# 3. Основные workstreams

1. Product foundation  
2. Backend skeleton  
3. Multi-store / stores  
4. Auth / roles / staff / couriers  
5. Catalog / search / availability  
6. Cart / checkout  
7. Orders / delivery operations  
8. Notifications  
9. Customer Mini App  
10. Admin panel  
11. Courier panel  
12. Security / QA / Release / Docs

---

# 4. Definition of Done

Задача считается завершенной, когда:
- код реализован;
- нет критичных TODO/FIXME;
- проходят lint / type / format checks;
- edge cases из задачи покрыты;
- добавлены тесты там, где они обязательны;
- обновлены docs/contracts при изменении API/логики;
- соблюдены ограничения MVP.

---

# 5. Full Task Breakdown v2

## EPIC A — Product foundation and governance

### TASK A-001
**Название:** Зафиксировать MVP scope  
**Цель:** Исключить расползание scope.  
**Контекст:** AI-исполнители склонны достраивать функции сверх задания.  
**In Scope:**
- formal MVP scope;
- backlog / non-MVP list;
- explicit constraints.
**Out of Scope:**
- implementation.
**Артефакты / Deliverables:**
- `docs/product/mvp_scope.md`
- `docs/product/backlog.md`
**Acceptance Criteria:**
- cash on delivery зафиксирован;
- карты, online payment, live tracking и auto-dispatch вынесены из MVP.
**Dependencies:** None  
**Suggested Owner:** Product / Architect  
**Notes / Edge Cases:**  
- future-ready ≠ implement now.

### TASK A-002
**Название:** Создать glossary и naming rules  
**Цель:** Синхронизировать терминологию.  
**Контекст:** Store/tenant/shop, operator/seller/manager могут начать использоваться хаотично.  
**In Scope:**
- glossary;
- naming rules;
- canonical role names;
- status naming rules.
**Out of Scope:**
- code implementation.
**Артефакты / Deliverables:**
- `docs/product/glossary.md`
- `docs/engineering/naming_conventions.md`
**Acceptance Criteria:**
- store/tenant разграничены;
- роли названы одинаково во всех документах.
**Dependencies:** A-001  
**Suggested Owner:** Architect  
**Notes / Edge Cases:**  
- если tenant == store в MVP, это должно быть записано явно.

### TASK A-003
**Название:** Подготовить repository structure  
**Цель:** Обеспечить безопасную параллельную разработку.  
**Контекст:** Несколько интерфейсов и backend должны быть разделены предсказуемо.  
**In Scope:**
- repo layout;
- branch rules;
- PR rules;
- shared contracts location.
**Out of Scope:**
- CI implementation.
**Артефакты / Deliverables:**
- `CONTRIBUTING.md`
- `CODEOWNERS`
- `docs/engineering/repo_layout.md`
**Acceptance Criteria:**
- ясно, где backend / Mini App / admin / courier / shared schemas.
**Dependencies:** A-001, A-002  
**Suggested Owner:** Tech Lead  
**Notes / Edge Cases:**  
- shared contracts не должны дублироваться.

---

## EPIC B — Architecture and backend skeleton

### TASK B-001
**Название:** Поднять backend skeleton  
**Цель:** Получить работающий backend-каркас.  
**Контекст:** Нужна база для независимой разработки модулей.  
**In Scope:**
- framework bootstrap;
- env config;
- DB connection;
- health endpoint;
- logging base.
**Out of Scope:**
- business logic.
**Артефакты / Deliverables:**
- running backend app;
- `.env.example`
- `/health`
**Acceptance Criteria:**
- backend стартует локально;
- есть подключение к PostgreSQL;
- secrets не захардкожены.
**Dependencies:** A-003  
**Suggested Owner:** Backend Lead  
**Notes / Edge Cases:**  
- dev/stage/prod paths должны быть предусмотрены.

### TASK B-002
**Название:** Описать module boundaries  
**Цель:** Не допустить смешения доменов.  
**Контекст:** Без явных границ логика начнет перетекать между модулями.  
**In Scope:**
- modules list;
- responsibilities;
- allowed dependencies;
- interfaces between modules.
**Out of Scope:**
- implementation.
**Артефакты / Deliverables:**
- `docs/architecture/backend_modules.md`
**Acceptance Criteria:**
- модули отделены;
- нет запланированных циклических зависимостей.
**Dependencies:** B-001  
**Suggested Owner:** Architect / Backend Lead  
**Notes / Edge Cases:**  
- shared module не должен стать “свалкой”.

### TASK B-003
**Название:** Настроить migrations и seed  
**Цель:** Сделать схему воспроизводимой.  
**Контекст:** Параллельная разработка требует дисциплины миграций.  
**In Scope:**
- migration tool;
- baseline migration;
- seed framework;
- DB reset flow.
**Out of Scope:**
- prod-only migration tooling beyond MVP.
**Артефакты / Deliverables:**
- migrations;
- seeds;
- reset docs.
**Acceptance Criteria:**
- новая БД поднимается с нуля;
- сиды создают базовый reference set.
**Dependencies:** B-001  
**Suggested Owner:** Backend Engineer  
**Notes / Edge Cases:**  
- сиды не должны требовать ручного SQL.

### TASK B-004
**Название:** Зафиксировать API error format  
**Цель:** Стандартизировать ошибки и API-поведение.  
**Контекст:** Все клиенты должны одинаково понимать backend.  
**In Scope:**
- versioning strategy;
- error envelope;
- validation/business error format;
- request/correlation ID.
**Out of Scope:**
- full endpoint list.
**Артефакты / Deliverables:**
- `docs/api/api_standards.md`
**Acceptance Criteria:**
- validation errors и business errors различимы;
- store not found / store closed / invalid transition описаны.
**Dependencies:** B-001, B-002  
**Suggested Owner:** Backend Lead  
**Notes / Edge Cases:**  
- формат должен быть удобен и UI, и логам.

### TASK B-005
**Название:** Подготовить base test harness  
**Цель:** Дать единый шаблон тестирования.  
**Контекст:** Иначе тесты будут хаотичными или их не будет.  
**In Scope:**
- unit test setup;
- integration test setup;
- test DB;
- factories/helpers.
**Out of Scope:**
- full coverage.
**Артефакты / Deliverables:**
- test config;
- sample tests.
**Acceptance Criteria:**
- unit и integration тесты запускаются локально.
**Dependencies:** B-001, B-003  
**Suggested Owner:** Backend Engineer / QA Automation  
**Notes / Edge Cases:**  
- тесты должны быть быстрыми и детерминированными.

### TASK B-006
**Название:** Подготовить observability baseline  
**Цель:** Заложить базовые логи и метрики.  
**Контекст:** Заказы и уведомления без наблюдаемости плохо отлаживаются.  
**In Scope:**
- structured logging;
- correlation ID;
- basic business logs;
- metrics foundation.
**Out of Scope:**
- full dashboards.
**Артефакты / Deliverables:**
- logging/metrics bootstrap.
**Acceptance Criteria:**
- запросы трассируются по correlation ID;
- критичные ошибки логируются структурированно.
**Dependencies:** B-001, B-004  
**Suggested Owner:** DevOps / Backend  
**Notes / Edge Cases:**  
- не логировать чувствительные данные целиком.

---

## EPIC C — Multi-store / Store domain

### TASK C-001
**Название:** Спроектировать store model  
**Цель:** Описать модель магазина и его настроек.  
**Контекст:** Store — основная единица изоляции и брендинга.  
**In Scope:**
- store entity;
- public fields;
- operational fields;
- status;
- slug/code.
**Out of Scope:**
- staff assignments.
**Артефакты / Deliverables:**
- ERD fragment;
- migrations.
**Acceptance Criteria:**
- store имеет unique slug/code;
- store supports public name, description, status.
**Dependencies:** B-003  
**Suggested Owner:** Backend Architect  
**Notes / Edge Cases:**  
- безопасная деактивация.

### TASK C-002
**Название:** Реализовать store resolution по deep link  
**Цель:** Открывать правильный магазин по start/startapp параметру.  
**Контекст:** Один бот обслуживает много магазинов.  
**In Scope:**
- parse link param;
- resolve store;
- validate availability;
- return public context.
**Out of Scope:**
- Telegram auth.
**Артефакты / Deliverables:**
- service + endpoint.
**Acceptance Criteria:**
- валидный код открывает нужный store;
- invalid code обрабатывается контролируемо.
**Dependencies:** C-001  
**Suggested Owner:** Backend Engineer  
**Notes / Edge Cases:**  
- inactive or temporarily closed store.

### TASK C-003
**Название:** Реализовать store settings domain  
**Цель:** Сделать единый источник store settings.  
**Контекст:** Delivery text, support, cash notice должны храниться централизованно.  
**In Scope:**
- delivery text;
- cash-only flag/message;
- support contacts;
- notice/banner text;
- order acceptance toggle.
**Out of Scope:**
- payment provider config;
- maps.
**Артефакты / Deliverables:**
- tables + service.
**Acceptance Criteria:**
- store settings читаются и редактируются;
- Mini App может их отобразить.
**Dependencies:** C-001  
**Suggested Owner:** Backend Engineer  
**Notes / Edge Cases:**  
- multiline public text.

### TASK C-004
**Название:** Реализовать working hours и temporary closure  
**Цель:** Блокировать заказы в нерабочее время.  
**Контекст:** Магазин не должен принимать заказ, если он закрыт.  
**In Scope:**
- regular schedule;
- temporary closure;
- open/closed calculation;
- close message.
**Out of Scope:**
- complex holiday calendar.
**Артефакты / Deliverables:**
- working hours domain.
**Acceptance Criteria:**
- backend умеет определить open/closed;
- create order блокируется при closed state.
**Dependencies:** C-003  
**Suggested Owner:** Backend Engineer  
**Notes / Edge Cases:**  
- overnight schedule.

### TASK C-005
**Название:** Реализовать store management API  
**Цель:** Дать platform admin управление магазинами.  
**Контекст:** Stores должны создаваться без ручных DB-операций.  
**In Scope:**
- create/update/list/view store;
- activate/deactivate.
**Out of Scope:**
- staff management.
**Артефакты / Deliverables:**
- admin API.
**Acceptance Criteria:**
- super-admin может управлять stores;
- slug/code уникален.
**Dependencies:** C-001, C-003, D-007  
**Suggested Owner:** Backend Engineer  
**Notes / Edge Cases:**  
- нельзя тихо сломать рабочий deep link.

### TASK C-006
**Название:** Реализовать public storefront bootstrap endpoint  
**Цель:** Дать Mini App одну точку начальной загрузки store context.  
**Контекст:** Старт Mini App должен быть простым и предсказуемым.  
**In Scope:**
- store info;
- working state;
- delivery/payment text;
- support;
- public flags.
**Out of Scope:**
- full catalog.
**Артефакты / Deliverables:**
- public bootstrap endpoint.
**Acceptance Criteria:**
- Mini App стартует с одного bootstrap request;
- closed/inactive states обрабатываются отдельно.
**Dependencies:** C-002, C-003, C-004  
**Suggested Owner:** Backend Engineer  
**Notes / Edge Cases:**  
- response should be stable.

---

## EPIC D — Identity / Auth / Roles / Staff / Couriers

### TASK D-001
**Название:** Спроектировать user identity model  
**Цель:** Стандартизировать всех пользователей платформы.  
**Контекст:** Один и тот же человек может быть клиентом и сотрудником.  
**In Scope:**
- user entity;
- Telegram linkage;
- user statuses;
- link to roles/assignments.
**Out of Scope:**
- full RBAC implementation.
**Артефакты / Deliverables:**
- user tables;
- identity doc.
**Acceptance Criteria:**
- user can have Telegram identity;
- user can have multiple assignments/roles.
**Dependencies:** B-003  
**Suggested Owner:** Backend Architect  
**Notes / Edge Cases:**  
- Telegram username may be absent.

### TASK D-002
**Название:** Реализовать Telegram auth verification  
**Цель:** Безопасно аутентифицировать Mini App users.  
**Контекст:** Telegram initData must be server-validated.  
**In Scope:**
- signature verification;
- parse payload;
- find/create user;
- issue session/token.
**Out of Scope:**
- email/password login.
**Артефакты / Deliverables:**
- auth endpoint;
- verification service.
**Acceptance Criteria:**
- valid initData accepted;
- invalid signature rejected.
**Dependencies:** D-001, B-004  
**Suggested Owner:** Backend Engineer  
**Notes / Edge Cases:**  
- missing optional Telegram fields.

### TASK D-003
**Название:** Реализовать session/token policy  
**Цель:** Дать единое поведение аутентифицированным сессиям.  
**Контекст:** Customer, admin и courier apps зависят от стабильной auth-модели.  
**In Scope:**
- access token/session;
- TTL;
- invalidation/logout;
- auth middleware.
**Out of Scope:**
- SSO.
**Артефакты / Deliverables:**
- session config + middleware.
**Acceptance Criteria:**
- protected endpoints требуют валидную сессию;
- expired sessions отвергаются.
**Dependencies:** D-002  
**Suggested Owner:** Backend Engineer  
**Notes / Edge Cases:**  
- separate docs for admin/courier if needed.

### TASK D-004
**Название:** Спроектировать RBAC matrix  
**Цель:** Четко разделить platform admin, store staff и couriers.  
**Контекст:** Ошибки в правах очень дороги после запуска.  
**In Scope:**
- role definitions;
- permission matrix;
- platform/store scope separation.
**Out of Scope:**
- dynamic permissions editor.
**Артефакты / Deliverables:**
- `docs/security/rbac_matrix.md`
**Acceptance Criteria:**
- courier не видит чужие заказы;
- store staff изолирован по store;
- super_admin отделен от store roles.
**Dependencies:** D-001  
**Suggested Owner:** Architect / Backend  
**Notes / Edge Cases:**  
- multi-store staff future support should be noted.

### TASK D-005
**Название:** Реализовать staff assignments  
**Цель:** Привязывать сотрудников к store и role.  
**Контекст:** Store users должны быть строго store-scoped.  
**In Scope:**
- assign/revoke staff;
- active/inactive state;
- list assignments;
- audit hooks.
**Out of Scope:**
- complex invitation workflow.
**Артефакты / Deliverables:**
- tables + admin API.
**Acceptance Criteria:**
- staff assignment влияет на доступ;
- деактивация assignment лишает доступа.
**Dependencies:** D-004, C-005  
**Suggested Owner:** Backend Engineer  
**Notes / Edge Cases:**  
- protect critical store role coverage if needed.

### TASK D-006
**Название:** Реализовать courier identity model  
**Цель:** Поддержать курьеров как отдельную operational сущность.  
**Контекст:** Курьеры нужны для назначения и выполнения доставки.  
**In Scope:**
- courier profile;
- active/inactive;
- available couriers list;
- store association policy.
**Out of Scope:**
- route optimization;
- live location.
**Артефакты / Deliverables:**
- courier domain + API.
**Acceptance Criteria:**
- inactive courier cannot be assigned;
- courier sees only own assigned orders.
**Dependencies:** D-004, D-005  
**Suggested Owner:** Backend Engineer  
**Notes / Edge Cases:**  
- document if couriers are global or store-local.

### TASK D-007
**Название:** Реализовать authorization policies  
**Цель:** Централизованно применять RBAC и scope checks.  
**Контекст:** Права не должны реализовываться хаотично в каждом endpoint.  
**In Scope:**
- auth guards;
- role checks;
- store scope checks;
- denial standards.
**Out of Scope:**
- public endpoints.
**Артефакты / Deliverables:**
- policy layer + tests.
**Acceptance Criteria:**
- store staff cannot access another store;
- courier cannot access admin operations.
**Dependencies:** D-003, D-004, D-005, D-006  
**Suggested Owner:** Backend Engineer  
**Notes / Edge Cases:**  
- check role and ownership/scope.

---

## EPIC E — Catalog / Search / Availability

### TASK E-001
**Название:** Спроектировать catalog domain model  
**Цель:** Описать категории, товары и доступность.  
**Контекст:** Каталог — ядро пользовательского UX.  
**In Scope:**
- category model;
- product model;
- pricing;
- image refs;
- availability;
- tags/labels minimal.
**Out of Scope:**
- advanced attributes engine.
**Артефакты / Deliverables:**
- ERD + migrations.
**Acceptance Criteria:**
- product/category store-scoped;
- product has name/description/price/availability/image.
**Dependencies:** B-003, C-001  
**Suggested Owner:** Backend Architect  
**Notes / Edge Cases:**  
- avoid overcomplicated product model.

### TASK E-002
**Название:** Реализовать category CRUD  
**Цель:** Дать store управление категориями.  
**Контекст:** Категории обязательны для MVP.  
**In Scope:**
- create/update/delete/archive category;
- sorting/order;
- active/inactive.
**Out of Scope:**
- deep nested taxonomy.
**Артефакты / Deliverables:**
- admin API.
**Acceptance Criteria:**
- неактивные категории не видны клиенту;
- CRUD работает store-scoped.
**Dependencies:** E-001, D-007  
**Suggested Owner:** Backend Engineer  
**Notes / Edge Cases:**  
- deletion strategy for non-empty categories.

### TASK E-003
**Название:** Реализовать product CRUD  
**Цель:** Дать store управление товарами.  
**Контекст:** Product card лежит в основе каталога, корзины и заказа.  
**In Scope:**
- create/update/delete/archive product;
- image attachment;
- price/old price;
- availability toggle;
- category linkage;
- tags/labels.
**Out of Scope:**
- variants matrix.
**Артефакты / Deliverables:**
- admin API + service.
**Acceptance Criteria:**
- product can be created/updated/hidden;
- invalid price rejected.
**Dependencies:** E-001, E-002, D-007  
**Suggested Owner:** Backend Engineer  
**Notes / Edge Cases:**  
- hidden product not shown publicly.

### TASK E-004
**Название:** Реализовать product image upload strategy  
**Цель:** Поддержать безопасные изображения товаров.  
**Контекст:** Каталог без изображений сильно теряет в UX.  
**In Scope:**
- upload endpoint/strategy;
- validation;
- storage references;
- file size/type constraints.
**Out of Scope:**
- image editing.
**Артефакты / Deliverables:**
- media flow.
**Acceptance Criteria:**
- image upload works;
- invalid files rejected.
**Dependencies:** E-003, B-006  
**Suggested Owner:** Backend / DevOps  
**Notes / Edge Cases:**  
- sanitize metadata.

### TASK E-005
**Название:** Реализовать public catalog read API  
**Цель:** Дать Mini App доступ к каталогу.  
**Контекст:** Клиентская витрина не зависит от админки.  
**In Scope:**
- categories list;
- products by category;
- product details;
- pagination/load more.
**Out of Scope:**
- recommendations.
**Артефакты / Deliverables:**
- public catalog endpoints.
**Acceptance Criteria:**
- hidden/inactive items not returned;
- only store-scoped catalog returned.
**Dependencies:** E-002, E-003  
**Suggested Owner:** Backend Engineer  
**Notes / Edge Cases:**  
- empty catalog handling.

### TASK E-006
**Название:** Реализовать public search API  
**Цель:** Дать поиск по товарам внутри store.  
**Контекст:** Поиск обязателен для MVP.  
**In Scope:**
- keyword search;
- empty query handling;
- no-results handling.
**Out of Scope:**
- typo-tolerant advanced search.
**Артефакты / Deliverables:**
- search endpoint/service.
**Acceptance Criteria:**
- search only within store;
- no-results returns valid empty response.
**Dependencies:** E-003, E-005  
**Suggested Owner:** Backend Engineer  
**Notes / Edge Cases:**  
- whitespace-only query.

### TASK E-007
**Название:** Реализовать availability rules  
**Цель:** Исключить заказ недоступных товаров.  
**Контекст:** Даже без full inventory engine клиент не должен оформить недоступный товар.  
**In Scope:**
- active/inactive;
- visible/hidden;
- orderable/not orderable;
- public rules.
**Out of Scope:**
- real-time stock sync.
**Артефакты / Deliverables:**
- availability service.
**Acceptance Criteria:**
- unavailable product cannot be added to cart;
- hidden product not shown.
**Dependencies:** E-003, F-003  
**Suggested Owner:** Backend Engineer  
**Notes / Edge Cases:**  
- item became unavailable after adding to cart.

### TASK E-008
**Название:** Реализовать minimal catalog import/export  
**Цель:** Упростить первичное наполнение каталога.  
**Контекст:** Большой каталог вручную заводить долго.  
**In Scope:**
- CSV import;
- validation report;
- partial failure reporting;
- export current catalog.
**Out of Scope:**
- bi-directional sync.
**Артефакты / Deliverables:**
- import/export flow + docs.
**Acceptance Criteria:**
- bulk import works;
- import errors understandable.
**Dependencies:** E-003, J-006  
**Suggested Owner:** Backend + Admin  
**Notes / Edge Cases:**  
- duplicate products, malformed rows.

---

## EPIC F — Customer profile / Addresses / Cart / Checkout

### TASK F-001
**Название:** Спроектировать customer profile model  
**Цель:** Поддержать клиентские данные для заказа.  
**Контекст:** Telegram identity сама по себе недостаточна для доставки.  
**In Scope:**
- customer profile;
- relation to user;
- saved addresses relation;
- contact fields.
**Out of Scope:**
- loyalty profile.
**Артефакты / Deliverables:**
- ERD + migrations.
**Acceptance Criteria:**
- customer profile usable for checkout and history.
**Dependencies:** D-001, B-003  
**Suggested Owner:** Backend Architect  
**Notes / Edge Cases:**  
- phone may need manual entry.

### TASK F-002
**Название:** Реализовать address book  
**Цель:** Дать клиенту сохранять адреса.  
**Контекст:** Повторные заказы должны быть быстрыми.  
**In Scope:**
- create/edit/delete address;
- default address;
- free-text delivery details;
- entrance/floor/apartment/comment.
**Out of Scope:**
- maps/geocoding.
**Артефакты / Deliverables:**
- customer address API.
**Acceptance Criteria:**
- address can be saved and reused;
- one address can be default.
**Dependencies:** F-001, D-003  
**Suggested Owner:** Backend Engineer  
**Notes / Edge Cases:**  
- long delivery comments.

### TASK F-003
**Название:** Спроектировать cart domain  
**Цель:** Поддержать корзину до оформления заказа.  
**Контекст:** Cart обязателен и для UX, и для backend validation.  
**In Scope:**
- cart entity;
- cart items;
- store binding;
- user binding;
- expiration/cleanup policy.
**Out of Scope:**
- abandoned cart marketing.
**Артефакты / Deliverables:**
- ERD + migrations.
**Acceptance Criteria:**
- one cart tied to one store and one user.
**Dependencies:** E-003, F-001  
**Suggested Owner:** Backend Architect  
**Notes / Edge Cases:**  
- cannot mix products from multiple stores.

### TASK F-004
**Название:** Реализовать cart API  
**Цель:** Дать клиенту все операции с корзиной.  
**Контекст:** Cart — основной pre-order объект.  
**In Scope:**
- get cart;
- add item;
- update quantity;
- remove item;
- clear cart;
- recalc totals.
**Out of Scope:**
- promo codes.
**Артефакты / Deliverables:**
- cart endpoints.
**Acceptance Criteria:**
- quantities validated;
- unavailable product cannot be added.
**Dependencies:** F-003, E-007  
**Suggested Owner:** Backend Engineer  
**Notes / Edge Cases:**  
- adding same item repeatedly.

### TASK F-005
**Название:** Реализовать checkout validation service  
**Цель:** Централизовать все серверные проверки checkout.  
**Контекст:** Frontend alone is not trustworthy.  
**In Scope:**
- cart not empty;
- store open;
- items available;
- address/contact present;
- payment method = cash;
- store order acceptance enabled.
**Out of Scope:**
- payment auth;
- map zone validation.
**Артефакты / Deliverables:**
- validation service + errors.
**Acceptance Criteria:**
- invalid checkout blocked for all listed reasons.
**Dependencies:** C-004, E-007, F-004  
**Suggested Owner:** Backend Engineer  
**Notes / Edge Cases:**  
- store disabled after cart was built.

### TASK F-006
**Название:** Спроектировать order placement input schema  
**Цель:** Формализовать payload оформления заказа.  
**Контекст:** Frontend/backend must speak the same checkout language.  
**In Scope:**
- address reference or inline address;
- contact fields;
- order comment;
- delivery timing mode minimal;
- substitution policy;
- fixed cash payment.
**Out of Scope:**
- payment tokens;
- slot optimization.
**Артефакты / Deliverables:**
- request schema docs.
**Acceptance Criteria:**
- all checkout fields canonically defined.
**Dependencies:** F-005  
**Suggested Owner:** Backend Architect / Frontend Lead  
**Notes / Edge Cases:**  
- keep MVP fields minimal.

### TASK F-007
**Название:** Реализовать create order from cart  
**Цель:** Создавать заказ атомарно из валидной корзины.  
**Контекст:** Core business use case of the platform.  
**In Scope:**
- transactional creation;
- order item snapshots;
- store/customer linkage;
- initial status assignment;
- cart cleanup;
- business event hooks.
**Out of Scope:**
- courier assignment;
- payment capture.
**Артефакты / Deliverables:**
- create order use case + endpoint.
**Acceptance Criteria:**
- order created atomically;
- initial status correct;
- cart moved to expected state.
**Dependencies:** F-005, F-006, G-001  
**Suggested Owner:** Backend Engineer  
**Notes / Edge Cases:**  
- duplicate submit / retry.

### TASK F-008
**Название:** Реализовать reorder foundation  
**Цель:** Поддержать повтор заказа.  
**Контекст:** Reorder critical for retention.  
**In Scope:**
- restore cart from previous order;
- handle unavailable items;
- partial restore result.
**Out of Scope:**
- instant one-click reorder without review.
**Артефакты / Deliverables:**
- reorder endpoint/service.
**Acceptance Criteria:**
- user can rebuild cart from previous order;
- unavailable items explained.
**Dependencies:** F-004, G-005  
**Suggested Owner:** Backend Engineer  
**Notes / Edge Cases:**  
- removed product, changed price.

---

## EPIC G — Orders / Statuses / Delivery operations

### TASK G-001
**Название:** Спроектировать order domain model  
**Цель:** Создать устойчивую модель заказа.  
**Контекст:** Order is the operational center of the whole product.  
**In Scope:**
- order entity;
- order item snapshot;
- status history;
- customer/store linkage;
- totals;
- address/comment;
- cash payment summary.
**Out of Scope:**
- invoices/tax complexity.
**Артефакты / Deliverables:**
- ERD + migrations.
**Acceptance Criteria:**
- order stores all required checkout and lifecycle data.
**Dependencies:** B-003, F-006  
**Suggested Owner:** Backend Architect  
**Notes / Edge Cases:**  
- totals must be snapshotted.

### TASK G-002
**Название:** Зафиксировать order status machine  
**Цель:** Сделать статусы и переходы детерминированными.  
**Контекст:** Status chaos is a common failure point.  
**In Scope:**
- status list;
- allowed transitions;
- actor permissions;
- invalid transition handling.
**Out of Scope:**
- custom per-store statuses.
**Артефакты / Deliverables:**
- `docs/product/order_status_machine.md`
**Acceptance Criteria:**
- every status has clear meaning and valid transitions.
**Dependencies:** G-001, A-002  
**Suggested Owner:** Architect / Backend Lead  
**Notes / Edge Cases:**  
- suggested statuses:
  - new
  - confirmed
  - assembling
  - awaiting_substitution_decision
  - ready_for_delivery
  - assigned_to_courier
  - in_delivery
  - delivered
  - cancelled

### TASK G-003
**Название:** Реализовать centralized status transition service  
**Цель:** Менять статусы только через один контролируемый слой.  
**Контекст:** Status changes must not be scattered across endpoints.  
**In Scope:**
- transition use case;
- actor validation;
- history recording;
- audit hooks;
- notification hooks.
**Out of Scope:**
- UI timeline rendering.
**Артефакты / Deliverables:**
- transition service + tests.
**Acceptance Criteria:**
- invalid transitions impossible through API.
**Dependencies:** G-002, D-007  
**Suggested Owner:** Backend Engineer  
**Notes / Edge Cases:**  
- concurrent updates.

### TASK G-004
**Название:** Реализовать order snapshot/totals policy  
**Цель:** Зафиксировать исторические значения заказа.  
**Контекст:** Order history must not depend on current catalog state.  
**In Scope:**
- item price snapshot;
- order totals snapshot;
- cash payment amount.
**Out of Scope:**
- tax engine;
- discounts stack.
**Артефакты / Deliverables:**
- pricing snapshot logic.
**Acceptance Criteria:**
- order history stable after catalog changes.
**Dependencies:** G-001, F-007  
**Suggested Owner:** Backend Engineer  
**Notes / Edge Cases:**  
- price changed after order placed.

### TASK G-005
**Название:** Реализовать customer order history API  
**Цель:** Дать клиенту доступ к своим текущим и прошлым заказам.  
**Контекст:** History and reorder are part of MVP UX.  
**In Scope:**
- order list;
- order details;
- timeline data;
- reorder hint.
**Out of Scope:**
- receipts download.
**Артефакты / Deliverables:**
- customer order endpoints.
**Acceptance Criteria:**
- customer sees only own orders;
- order detail complete and consistent.
**Dependencies:** G-001, G-002, D-007  
**Suggested Owner:** Backend Engineer  
**Notes / Edge Cases:**  
- internal notes must not leak.

### TASK G-006
**Название:** Реализовать substitution policy model  
**Цель:** Поддержать обработку отсутствующих товаров.  
**Контекст:** Grocery delivery without substitution logic becomes operationally messy.  
**In Scope:**
- allow substitution;
- contact before substitution;
- do not substitute.
**Out of Scope:**
- AI substitute recommendations.
**Артефакты / Deliverables:**
- substitution fields in order.
**Acceptance Criteria:**
- substitution preference captured at checkout;
- visible to store staff.
**Dependencies:** F-006, G-001  
**Suggested Owner:** Backend Architect  
**Notes / Edge Cases:**  
- policy should stay simple for MVP.

### TASK G-007
**Название:** Реализовать minimal substitution workflow  
**Цель:** Дать store staff минимальный рабочий flow замены/удаления товаров.  
**Контекст:** Missing items must be handled explicitly.  
**In Scope:**
- mark item unavailable during assembly;
- record issue;
- move order to awaiting_substitution_decision if needed;
- resolve by policy;
- update order summary.
**Out of Scope:**
- full customer chat negotiation.
**Артефакты / Deliverables:**
- staff substitution API.
**Acceptance Criteria:**
- substitution issue recorded and visible in history.
**Dependencies:** G-003, G-006, J-008  
**Suggested Owner:** Backend Engineer  
**Notes / Edge Cases:**  
- do-not-substitute must support removal without silent replacement.

### TASK G-008
**Название:** Реализовать manual courier assignment  
**Цель:** Поддержать ручное назначение курьера.  
**Контекст:** Auto-assignment is not in MVP.  
**In Scope:**
- available couriers list;
- assign courier;
- reassign if policy allows;
- status update to assigned_to_courier;
- audit + notifications hooks.
**Out of Scope:**
- auto dispatch.
**Артефакты / Deliverables:**
- assignment service + endpoint.
**Acceptance Criteria:**
- active courier can be assigned manually by authorized actor.
**Dependencies:** D-006, G-003  
**Suggested Owner:** Backend Engineer  
**Notes / Edge Cases:**  
- reassign after acceptance.

### TASK G-009
**Название:** Реализовать courier delivery status flow  
**Цель:** Дать курьеру управление delivery statuses.  
**Контекст:** Courier must manage the last mile statuses.  
**In Scope:**
- mark in_delivery;
- mark delivered;
- failure/problem state if supported;
- delivery timestamp.
**Out of Scope:**
- proof photo upload;
- live location.
**Артефакты / Deliverables:**
- courier status endpoints.
**Acceptance Criteria:**
- only assigned courier can change allowed statuses.
**Dependencies:** G-002, G-008, K-004  
**Suggested Owner:** Backend Engineer  
**Notes / Edge Cases:**  
- delivered by wrong courier must be impossible.

### TASK G-010
**Название:** Реализовать cancellation rules  
**Цель:** Сделать отмену заказа понятной и аудируемой.  
**Контекст:** Cancellation policy affects both UX and operations.  
**In Scope:**
- who can cancel;
- when can cancel;
- reason capture;
- transition to cancelled.
**Out of Scope:**
- refunds.
**Артефакты / Deliverables:**
- cancellation service + docs.
**Acceptance Criteria:**
- cancellation always records actor and reason.
**Dependencies:** G-002, G-003  
**Suggested Owner:** Backend Engineer / Product  
**Notes / Edge Cases:**  
- cancellation after courier assignment may be restricted.

---

## EPIC H — Notifications

### TASK H-001
**Название:** Спроектировать notification domain  
**Цель:** Создать единый механизм уведомлений.  
**Контекст:** Customers, staff and couriers all need system notifications.  
**In Scope:**
- event types;
- audiences;
- channel abstraction;
- templates placeholders;
- send status logging.
**Out of Scope:**
- marketing campaigns.
**Артефакты / Deliverables:**
- notification model + docs.
**Acceptance Criteria:**
- event types and target audiences are explicit.
**Dependencies:** B-006, G-003  
**Suggested Owner:** Backend Architect  
**Notes / Edge Cases:**  
- retry without uncontrolled duplicate noise.

### TASK H-002
**Название:** Реализовать Telegram notification sender  
**Цель:** Отправлять системные уведомления через Telegram bot.  
**Контекст:** Telegram is the primary communication channel in MVP.  
**In Scope:**
- send to customer;
- send to staff;
- send to courier;
- error handling;
- minimal retry policy.
**Out of Scope:**
- email/SMS.
**Артефакты / Deliverables:**
- sender service.
**Acceptance Criteria:**
- notifications can be sent programmatically and logged.
**Dependencies:** H-001, D-002  
**Suggested Owner:** Backend Engineer  
**Notes / Edge Cases:**  
- bot blocked by user.

### TASK H-003
**Название:** Реализовать notification templates  
**Цель:** Стандартизировать тексты уведомлений.  
**Контекст:** Message copy must remain consistent and role-aware.  
**In Scope:**
- new order;
- order confirmed;
- courier assigned;
- in delivery;
- delivered;
- cancelled;
- substitution-related minimal.
**Out of Scope:**
- promo copywriting.
**Артефакты / Deliverables:**
- template files/config.
**Acceptance Criteria:**
- texts consistent with MVP and contain required fields.
**Dependencies:** H-001  
**Suggested Owner:** Product / Backend  
**Notes / Edge Cases:**  
- no internal-only info leakage.

### TASK H-004
**Название:** Реализовать notification trigger map  
**Цель:** Явно связать business events and notifications.  
**Контекст:** Notifications are often lost or duplicated without explicit mapping.  
**In Scope:**
- event-to-notification mapping;
- dedup notes;
- idempotency considerations.
**Out of Scope:**
- generic event bus platform.
**Артефакты / Deliverables:**
- `docs/architecture/notification_triggers.md`
**Acceptance Criteria:**
- every key order event has a clear notification trigger.
**Dependencies:** G-003, H-002, H-003  
**Suggested Owner:** Backend Engineer  
**Notes / Edge Cases:**  
- retries after successful send.

### TASK H-005
**Название:** Реализовать public store notices  
**Цель:** Дать магазину возможность показывать важные notices в витрине.  
**Контекст:** Store may need temporary public messages.  
**In Scope:**
- store notice text;
- bootstrap support;
- empty state handling.
**Out of Scope:**
- full CMS.
**Артефакты / Deliverables:**
- API support.
**Acceptance Criteria:**
- store notice available in Mini App bootstrap/home.
**Dependencies:** C-003, I-002  
**Suggested Owner:** Backend + Mini App  
**Notes / Edge Cases:**  
- sanitize public content.

---

## EPIC I — Customer Mini App

### TASK I-001
**Название:** Поднять Mini App skeleton  
**Цель:** Создать основу клиентского интерфейса.  
**Контекст:** Mini App is the main customer-facing entry point.  
**In Scope:**
- framework bootstrap;
- routing/state;
- Telegram integration basics;
- env config.
**Out of Scope:**
- business screens.
**Артефакты / Deliverables:**
- running Mini App skeleton.
**Acceptance Criteria:**
- app starts locally;
- Telegram context readable.
**Dependencies:** A-003, C-006, D-002  
**Suggested Owner:** Frontend Lead  
**Notes / Edge Cases:**  
- stack should stay maintainable.

### TASK I-002
**Название:** Реализовать startup bootstrap/auth flow  
**Цель:** Авторизовать пользователя и загрузить store context.  
**Контекст:** First load must be fast and deterministic.  
**In Scope:**
- auth call;
- public bootstrap call;
- loading/error handling;
- closed/inactive store states.
**Out of Scope:**
- catalog UI.
**Артефакты / Deliverables:**
- startup flow.
**Acceptance Criteria:**
- Mini App gets session and store bootstrap on open.
**Dependencies:** I-001, D-002, C-006  
**Suggested Owner:** Frontend Engineer  
**Notes / Edge Cases:**  
- stale deep link.

### TASK I-003
**Название:** Реализовать Mini App design system foundation  
**Цель:** Подготовить reusable UI primitives.  
**Контекст:** Consistency across screens matters for speed and quality.  
**In Scope:**
- buttons;
- inputs;
- cards;
- badges;
- loaders;
- empty states;
- error states.
**Out of Scope:**
- per-screen polish.
**Артефакты / Deliverables:**
- UI primitives library.
**Acceptance Criteria:**
- shared components used across screens.
**Dependencies:** I-001  
**Suggested Owner:** Frontend Engineer  
**Notes / Edge Cases:**  
- Telegram theme compatibility.

### TASK I-004
**Название:** Реализовать storefront home  
**Цель:** Дать клиенту стартовую точку магазина.  
**Контекст:** Home screen must quickly orient the user.  
**In Scope:**
- store header;
- delivery/payment text;
- categories entry;
- search entry;
- support entry.
**Out of Scope:**
- recommendations.
**Артефакты / Deliverables:**
- home screen.
**Acceptance Criteria:**
- customer sees store info, delivery text and cash note immediately.
**Dependencies:** I-002, E-005, H-005  
**Suggested Owner:** Frontend Engineer  
**Notes / Edge Cases:**  
- closed store state.

### TASK I-005
**Название:** Реализовать category browsing UI  
**Цель:** Дать навигацию по категориям.  
**Контекст:** Category browsing is mandatory for MVP.  
**In Scope:**
- category list;
- products by category;
- empty category state;
- add-to-cart entry points.
**Out of Scope:**
- advanced filters.
**Артефакты / Deliverables:**
- category screens.
**Acceptance Criteria:**
- category products display correctly and allow cart actions.
**Dependencies:** I-003, E-005, F-004  
**Suggested Owner:** Frontend Engineer  
**Notes / Edge Cases:**  
- missing image fallback.

### TASK I-006
**Название:** Реализовать product details UI  
**Цель:** Дать информативную карточку товара.  
**Контекст:** Product page helps user decide and add to cart confidently.  
**In Scope:**
- image;
- title;
- description;
- price;
- old price;
- availability;
- add-to-cart.
**Out of Scope:**
- reviews.
**Артефакты / Deliverables:**
- product details screen.
**Acceptance Criteria:**
- unavailable product cannot be ordered.
**Dependencies:** I-003, E-005, F-004  
**Suggested Owner:** Frontend Engineer  
**Notes / Edge Cases:**  
- product disappeared between list/details fetch.

### TASK I-007
**Название:** Реализовать search UI  
**Цель:** Дать поиск по товарам магазина.  
**Контекст:** Search is mandatory for large catalogs.  
**In Scope:**
- input;
- results list;
- empty query state;
- no results;
- error state.
**Out of Scope:**
- advanced autocomplete.
**Артефакты / Deliverables:**
- search screen.
**Acceptance Criteria:**
- search works within store and supports add-to-cart from results.
**Dependencies:** I-003, E-006, F-004  
**Suggested Owner:** Frontend Engineer  
**Notes / Edge Cases:**  
- repeated fast queries.

### TASK I-008
**Название:** Реализовать cart UI  
**Цель:** Дать прозрачный экран корзины.  
**Контекст:** Cart is the main pre-checkout screen.  
**In Scope:**
- items list;
- quantity controls;
- remove item;
- empty cart;
- totals;
- checkout CTA.
**Out of Scope:**
- promo codes.
**Артефакты / Deliverables:**
- cart screen.
**Acceptance Criteria:**
- totals refresh correctly;
- empty cart state handled.
**Dependencies:** I-003, F-004  
**Suggested Owner:** Frontend Engineer  
**Notes / Edge Cases:**  
- item became unavailable while cart screen open.

### TASK I-009
**Название:** Реализовать profile/address book UI  
**Цель:** Дать клиенту управление адресами и базовыми данными.  
**Контекст:** Address book accelerates repeat orders.  
**In Scope:**
- profile basics;
- addresses list;
- create/edit/delete address;
- set default.
**Out of Scope:**
- map picker.
**Артефакты / Deliverables:**
- profile and address screens.
**Acceptance Criteria:**
- customer can manage saved addresses without maps.
**Dependencies:** I-003, F-002  
**Suggested Owner:** Frontend Engineer  
**Notes / Edge Cases:**  
- very long address comments.

### TASK I-010
**Название:** Реализовать checkout UI  
**Цель:** Собрать все данные заказа в одном потоке.  
**Контекст:** Checkout must be simple and explicit.  
**In Scope:**
- address selection;
- contact fields;
- order comment;
- substitution preference;
- payment display (cash only);
- place order CTA;
- validation errors.
**Out of Scope:**
- online payment UI.
**Артефакты / Deliverables:**
- checkout flow.
**Acceptance Criteria:**
- cash-on-delivery shown clearly;
- unsupported payment methods cannot be selected.
**Dependencies:** I-003, F-006, F-007  
**Suggested Owner:** Frontend Engineer  
**Notes / Edge Cases:**  
- double submit.

### TASK I-011
**Название:** Реализовать order success/current order UI  
**Цель:** Показать результат оформления и текущий статус.  
**Контекст:** User should feel control after placing an order.  
**In Scope:**
- success screen;
- current order summary;
- timeline;
- support CTA;
- cash reminder.
**Out of Scope:**
- live map.
**Артефакты / Deliverables:**
- success/current order screens.
**Acceptance Criteria:**
- user sees order id/status/timeline immediately after order creation.
**Dependencies:** I-010, G-005  
**Suggested Owner:** Frontend Engineer  
**Notes / Edge Cases:**  
- delayed response after successful backend create.

### TASK I-012
**Название:** Реализовать order history and reorder UI  
**Цель:** Поддержать past orders and reorder.  
**Контекст:** History and reorder are key retention features.  
**In Scope:**
- order list;
- order details;
- reorder CTA;
- unavailable items messaging.
**Out of Scope:**
- invoice download.
**Артефакты / Deliverables:**
- history screens.
**Acceptance Criteria:**
- user sees own past orders and can restore cart from them.
**Dependencies:** I-003, G-005, F-008  
**Suggested Owner:** Frontend Engineer  
**Notes / Edge Cases:**  
- removed items in old order.

---

## EPIC J — Admin panel

### TASK J-001
**Название:** Поднять admin panel skeleton  
**Цель:** Создать основу внутренней панели.  
**Контекст:** Operations require a dedicated admin interface.  
**In Scope:**
- bootstrap;
- auth/session integration;
- routing/layout.
**Out of Scope:**
- business pages.
**Артефакты / Deliverables:**
- running admin panel skeleton.
**Acceptance Criteria:**
- app starts locally;
- auth integration planned.
**Dependencies:** A-003, D-003  
**Suggested Owner:** Frontend Lead  
**Notes / Edge Cases:**  
- platform admin and store staff may share one app but with scoped access.

### TASK J-002
**Название:** Реализовать admin design system  
**Цель:** Подготовить internal UI primitives.  
**Контекст:** Admin app includes many forms, tables and status controls.  
**In Scope:**
- tables;
- forms;
- modals;
- badges;
- empty/loading/error states.
**Out of Scope:**
- per-page final polish.
**Артефакты / Deliverables:**
- admin component base.
**Acceptance Criteria:**
- reusable internal components available.
**Dependencies:** J-001  
**Suggested Owner:** Frontend Engineer  
**Notes / Edge Cases:**  
- destructive actions need confirmation UI.

### TASK J-003
**Название:** Реализовать admin auth/navigation guards  
**Цель:** Ограничить доступ и видимость по ролям.  
**Контекст:** Super-admin and store staff must not share unrestricted navigation.  
**In Scope:**
- route guards;
- role-aware navigation;
- forbidden screens.
**Out of Scope:**
- custom permission editor.
**Артефакты / Deliverables:**
- navigation/access layer.
**Acceptance Criteria:**
- unauthorized users cannot open forbidden pages.
**Dependencies:** J-001, D-007  
**Suggested Owner:** Frontend Engineer  
**Notes / Edge Cases:**  
- direct URL access to forbidden routes.

### TASK J-004
**Название:** Реализовать store management UI  
**Цель:** Дать super-admin управление stores.  
**Контекст:** Store setup should happen through UI.  
**In Scope:**
- stores list;
- create/edit store;
- activate/deactivate;
- public settings editing.
**Out of Scope:**
- advanced staff management in same view.
**Артефакты / Deliverables:**
- store management screens.
**Acceptance Criteria:**
- super-admin can create and maintain stores.
**Dependencies:** J-002, C-005  
**Suggested Owner:** Frontend Engineer  
**Notes / Edge Cases:**  
- dangerous deactivation confirmation.

### TASK J-005
**Название:** Реализовать staff management UI  
**Цель:** Дать управление store staff.  
**Контекст:** Staff assignment is core operational setup.  
**In Scope:**
- staff list;
- add/remove assignment;
- role assignment;
- activate/deactivate assignment.
**Out of Scope:**
- complex invitations.
**Артефакты / Deliverables:**
- staff management screens.
**Acceptance Criteria:**
- store manager/operator/catalog manager assignments manageable via UI.
**Dependencies:** J-002, D-005  
**Suggested Owner:** Frontend Engineer  
**Notes / Edge Cases:**  
- last critical manager protection if policy requires.

### TASK J-006
**Название:** Реализовать catalog management UI  
**Цель:** Дать магазину управление категориями и товарами.  
**Контекст:** Catalog maintenance is a daily operation.  
**In Scope:**
- categories UI;
- products UI;
- create/edit product form;
- image upload;
- availability/hide actions;
- import/export entry point.
**Out of Scope:**
- advanced merchandising dashboards.
**Артефакты / Deliverables:**
- catalog management screens.
**Acceptance Criteria:**
- store staff can manage products and categories end-to-end.
**Dependencies:** J-002, E-002, E-003, E-004, E-008  
**Suggested Owner:** Frontend Engineer  
**Notes / Edge Cases:**  
- large product lists.

### TASK J-007
**Название:** Реализовать orders list UI  
**Цель:** Дать staff рабочий экран заказов.  
**Контекст:** This is the primary operational list for stores.  
**In Scope:**
- order list/table;
- status filters;
- search by order/customer minimal;
- summary fields.
**Out of Scope:**
- analytics dashboards.
**Артефакты / Deliverables:**
- orders list screen.
**Acceptance Criteria:**
- staff sees only own store orders;
- filters work.
**Dependencies:** J-002, G-005, D-007  
**Suggested Owner:** Frontend Engineer  
**Notes / Edge Cases:**  
- many active orders.

### TASK J-008
**Название:** Реализовать order details and actions UI  
**Цель:** Дать staff полный control center для одного заказа.  
**Контекст:** Confirmation, assembly, substitutions, courier assignment and cancellation should converge in one screen.  
**In Scope:**
- order details;
- status actions;
- substitution actions;
- courier assignment;
- cancellation;
- timeline/history.
**Out of Scope:**
- embedded customer chat.
**Артефакты / Deliverables:**
- order details screen.
**Acceptance Criteria:**
- allowed actions available and forbidden actions blocked.
**Dependencies:** J-007, G-003, G-007, G-008, G-010  
**Suggested Owner:** Frontend Engineer  
**Notes / Edge Cases:**  
- stale order state during concurrent work.

### TASK J-009
**Название:** Реализовать store settings UI  
**Цель:** Дать store управление delivery text, working hours and public notices.  
**Контекст:** These settings must be editable without code changes.  
**In Scope:**
- delivery text;
- working hours;
- support contacts;
- notice text;
- order acceptance toggle;
- cash payment info.
**Out of Scope:**
- payment gateway config;
- maps.
**Артефакты / Deliverables:**
- settings screens/forms.
**Acceptance Criteria:**
- settings saved in admin become visible in Mini App.
**Dependencies:** J-002, C-003, C-004  
**Suggested Owner:** Frontend Engineer  
**Notes / Edge Cases:**  
- malformed schedule input blocked.

### TASK J-010
**Название:** Реализовать minimal audit view UI  
**Цель:** Дать admin/store manager просмотр ключевых действий.  
**Контекст:** Audit UI helps debugging and accountability.  
**In Scope:**
- audit list;
- minimal filters;
- details preview.
**Out of Scope:**
- enterprise forensic tooling.
**Артефакты / Deliverables:**
- audit screen.
**Acceptance Criteria:**
- key actions traceable via UI.
**Dependencies:** L-002, J-002  
**Suggested Owner:** Frontend Engineer  
**Notes / Edge Cases:**  
- pagination for large logs.

---

## EPIC K — Courier panel

### TASK K-001
**Название:** Поднять courier panel skeleton  
**Цель:** Создать отдельный минимальный интерфейс курьера.  
**Контекст:** Courier UI must remain extremely focused.  
**In Scope:**
- bootstrap;
- auth/session integration;
- mobile-first layout.
**Out of Scope:**
- business pages.
**Артефакты / Deliverables:**
- running courier app skeleton.
**Acceptance Criteria:**
- courier app starts locally.
**Dependencies:** A-003, D-003  
**Suggested Owner:** Frontend Lead  
**Notes / Edge Cases:**  
- PWA/web format acceptable if chosen.

### TASK K-002
**Название:** Реализовать courier auth/guards UI  
**Цель:** Ограничить courier panel только courier-сценариями.  
**Контекст:** Courier should never end up in admin flows.  
**In Scope:**
- session guard;
- courier-only route protection;
- forbidden state screens.
**Out of Scope:**
- admin role support.
**Артефакты / Deliverables:**
- access layer.
**Acceptance Criteria:**
- only courier-authorized users can use the panel.
**Dependencies:** K-001, D-007  
**Suggested Owner:** Frontend Engineer  
**Notes / Edge Cases:**  
- expired session mid-use.

### TASK K-003
**Название:** Реализовать assigned orders list UI  
**Цель:** Дать курьеру список назначенных заказов.  
**Контекст:** This is the main working screen for couriers.  
**In Scope:**
- active assigned orders;
- delivered/history minimal;
- summary cards;
- status chips.
**Out of Scope:**
- route map.
**Артефакты / Deliverables:**
- orders list screen.
**Acceptance Criteria:**
- courier sees only own assigned orders.
**Dependencies:** K-001, G-008  
**Suggested Owner:** Frontend Engineer  
**Notes / Edge Cases:**  
- reassigned order visibility changes predictably.

### TASK K-004
**Название:** Реализовать courier order details/actions UI  
**Цель:** Дать курьеру нужные delivery details и allowed actions.  
**Контекст:** Courier needs address, contact and final status actions.  
**In Scope:**
- order detail;
- address and delivery instructions;
- contact info;
- mark in delivery;
- mark delivered;
- failure/problem action if supported;
- cash reminder.
**Out of Scope:**
- live tracking.
**Артефакты / Deliverables:**
- courier details screen.
**Acceptance Criteria:**
- courier can perform only allowed actions on assigned orders.
**Dependencies:** K-003, G-009  
**Suggested Owner:** Frontend Engineer  
**Notes / Edge Cases:**  
- cash collection reminder must be prominent.

### TASK K-005
**Название:** Реализовать courier profile/settings UI  
**Цель:** Дать минимальный профиль and sign out.  
**Контекст:** Courier app still needs basic identity and session controls.  
**In Scope:**
- profile summary;
- active/inactive indication;
- sign out;
- support/help info.
**Out of Scope:**
- courier analytics.
**Артефакты / Deliverables:**
- profile screen.
**Acceptance Criteria:**
- courier can sign out;
- profile info visible.
**Dependencies:** K-001, D-006  
**Suggested Owner:** Frontend Engineer  
**Notes / Edge Cases:**  
- deactivation during active session.

---

## EPIC L — Audit / Security / Hardening

### TASK L-001
**Название:** Реализовать audit event model  
**Цель:** Фиксировать критичные действия системы и пользователей.  
**Контекст:** Audit is mandatory for multi-user operations.  
**In Scope:**
- event schema;
- actor/entity/action/timestamp;
- metadata strategy.
**Out of Scope:**
- enterprise SIEM integration.
**Артефакты / Deliverables:**
- audit tables/docs.
**Acceptance Criteria:**
- audit model supports store/catalog/order/staff actions.
**Dependencies:** B-003  
**Suggested Owner:** Backend Architect  
**Notes / Edge Cases:**  
- avoid secret leakage in metadata.

### TASK L-002
**Название:** Интегрировать audit logging в критичные домены  
**Цель:** Подключить audit ко всем ключевым действиям MVP.  
**Контекст:** Audit model without real writes is useless.  
**In Scope:**
- store create/update;
- staff assign/revoke;
- product/category changes;
- order status changes;
- courier assignment;
- cancellations.
**Out of Scope:**
- logging of all read actions.
**Артефакты / Deliverables:**
- audit writes in services.
**Acceptance Criteria:**
- critical actions traceable by actor/entity/time.
**Dependencies:** L-001, C-005, D-005, E-003, G-003, G-008, G-010  
**Suggested Owner:** Backend Engineer  
**Notes / Edge Cases:**  
- system actor vs human actor distinction.

### TASK L-003
**Название:** Реализовать validation and sanitization baseline  
**Цель:** Минимизировать грязные данные и простые инъекции.  
**Контекст:** There are many free-text fields across the product.  
**In Scope:**
- schema validation;
- string limits;
- sanitization rules;
- rendered text safety.
**Out of Scope:**
- full WAF.
**Артефакты / Deliverables:**
- validation middleware/utilities.
**Acceptance Criteria:**
- invalid/dangerous payloads rejected or sanitized.
**Dependencies:** B-004, E-004  
**Suggested Owner:** Backend Engineer / Security-minded Engineer  
**Notes / Edge Cases:**  
- HTML/script injection in public text fields.

### TASK L-004
**Название:** Реализовать rate limiting baseline  
**Цель:** Защитить публичные endpoints от очевидного abuse.  
**Контекст:** Public/auth/search/order creation endpoints must not stay unprotected.  
**In Scope:**
- limits for auth/bootstrap/search/create order;
- abuse logging;
- configurable thresholds.
**Out of Scope:**
- enterprise anti-bot systems.
**Артефакты / Deliverables:**
- rate limiting config.
**Acceptance Criteria:**
- critical public endpoints limited with controlled responses.
**Dependencies:** B-006, D-002  
**Suggested Owner:** Backend / DevOps  
**Notes / Edge Cases:**  
- avoid hurting real users with too strict limits.

### TASK L-005
**Название:** Реализовать config/secrets policy  
**Цель:** Убрать хаос конфигурации и риск утечек.  
**Контекст:** Bot tokens, DB secrets, storage keys require disciplined handling.  
**In Scope:**
- env variable catalog;
- secret naming rules;
- config separation;
- startup validation.
**Out of Scope:**
- cloud secret manager automation.
**Артефакты / Deliverables:**
- `docs/engineering/config_policy.md`
**Acceptance Criteria:**
- missing critical secrets caught at startup;
- `.env.example` complete and current.
**Dependencies:** B-001  
**Suggested Owner:** DevOps / Backend  
**Notes / Edge Cases:**  
- avoid silent defaults for critical secrets.

---

## EPIC M — QA / Testing / Release readiness

### TASK M-001
**Название:** Создать master test strategy  
**Цель:** Зафиксировать уровни и охват тестирования.  
**Контекст:** Multi-panel system needs an explicit testing strategy.  
**In Scope:**
- unit/integration/e2e scope;
- critical flows list;
- smoke list;
- owner matrix.
**Out of Scope:**
- full implementation of all tests.
**Артефакты / Deliverables:**
- `docs/qa/test_strategy.md`
**Acceptance Criteria:**
- critical customer/admin/courier flows identified.
**Dependencies:** B-005  
**Suggested Owner:** QA Lead / Tech Lead  
**Notes / Edge Cases:**  
- include access isolation checks.

### TASK M-002
**Название:** Реализовать backend unit tests для core rules  
**Цель:** Защитить ключевую доменную логику.  
**Контекст:** Status machine, checkout validation, RBAC are especially regression-prone.  
**In Scope:**
- order status tests;
- checkout validation tests;
- store open/closed tests;
- RBAC tests;
- cart behavior tests.
**Out of Scope:**
- frontend tests.
**Артефакты / Deliverables:**
- unit test suites.
**Acceptance Criteria:**
- core business rules covered.
**Dependencies:** G-002, F-005, C-004, D-007  
**Suggested Owner:** Backend Engineer / QA Automation  
**Notes / Edge Cases:**  
- unhappy paths included.

### TASK M-003
**Название:** Реализовать backend integration tests для критичных flows  
**Цель:** Проверить серверные сквозные сценарии.  
**Контекст:** Modules must work together, not only in isolation.  
**In Scope:**
- auth + bootstrap;
- cart + checkout + create order;
- status transitions;
- courier assignment;
- cancellation.
**Out of Scope:**
- load testing.
**Артефакты / Deliverables:**
- integration test suites.
**Acceptance Criteria:**
- critical happy/unhappy paths reproducibly pass.
**Dependencies:** D-002, C-006, F-007, G-008, G-010  
**Suggested Owner:** Backend Engineer / QA Automation  
**Notes / Edge Cases:**  
- duplicate create order request checks if implemented.

### TASK M-004
**Название:** Реализовать Mini App smoke tests  
**Цель:** Зафиксировать базовую работоспособность customer UI.  
**Контекст:** Customer-facing regressions are highly visible.  
**In Scope:**
- startup;
- category browsing;
- search;
- cart;
- checkout happy path mocked;
- history open.
**Out of Scope:**
- visual regression suite.
**Артефакты / Deliverables:**
- Mini App smoke tests.
**Acceptance Criteria:**
- critical customer flows caught automatically.
**Dependencies:** I-010, I-012  
**Suggested Owner:** Frontend Engineer / QA Automation  
**Notes / Edge Cases:**  
- stable mocks required.

### TASK M-005
**Название:** Реализовать admin/courier smoke tests  
**Цель:** Защитить основные internal operational маршруты.  
**Контекст:** Broken admin or courier panel breaks service operations.  
**In Scope:**
- admin access;
- store list;
- catalog page open;
- order details open;
- courier assigned orders;
- courier delivered action smoke.
**Out of Scope:**
- exhaustive UI tests.
**Артефакты / Deliverables:**
- smoke test suites.
**Acceptance Criteria:**
- major operational screen failures caught automatically.
**Dependencies:** J-008, K-004  
**Suggested Owner:** Frontend Engineer / QA Automation  
**Notes / Edge Cases:**  
- fixture stability.

### TASK M-006
**Название:** Создать manual release checklist  
**Цель:** Подготовить ручную приемку перед MVP launch.  
**Контекст:** Manual QA remains necessary even with automation.  
**In Scope:**
- customer flows;
- admin flows;
- courier flows;
- notifications;
- access control;
- store closed/unavailable product checks.
**Out of Scope:**
- post-MVP exploratory matrix.
**Артефакты / Deliverables:**
- `docs/qa/manual_release_checklist.md`
**Acceptance Criteria:**
- checklist sufficient for pre-release acceptance.
**Dependencies:** major functional epics near completion  
**Suggested Owner:** QA Lead / Product  
**Notes / Edge Cases:**  
- include cross-role isolation.

---

## EPIC N — DevOps / Environments / Release

### TASK N-001
**Название:** Настроить local developer environment  
**Цель:** Обеспечить быстрый локальный старт проекта.  
**Контекст:** Multi-app stack must be reproducible for all contributors.  
**In Scope:**
- local DB;
- local backend;
- local Mini App/admin/courier run;
- env templates;
- start commands.
**Out of Scope:**
- cloud deploy.
**Артефакты / Deliverables:**
- local setup docs/scripts.
**Acceptance Criteria:**
- a new developer can run the stack via docs.
**Dependencies:** B-001, I-001, J-001, K-001  
**Suggested Owner:** Tech Lead / DevOps  
**Notes / Edge Cases:**  
- keep bootstrap simple.

### TASK N-002
**Название:** Настроить CI pipelines  
**Цель:** Автоматически контролировать сборку и качество.  
**Контекст:** Parallel development without CI is unstable.  
**In Scope:**
- lint/type/test pipelines;
- backend build;
- frontend builds;
- PR checks.
**Out of Scope:**
- full CD.
**Артефакты / Deliverables:**
- CI config.
**Acceptance Criteria:**
- broken checks block merges.
**Dependencies:** B-005, I-001, J-001, K-001  
**Suggested Owner:** DevOps / Tech Lead  
**Notes / Edge Cases:**  
- pipeline time should stay reasonable.

### TASK N-003
**Название:** Настроить stage-like environment  
**Цель:** Подготовить отдельную среду для интеграционной проверки.  
**Контекст:** Local-only testing is insufficient for this product.  
**In Scope:**
- stage env;
- separate config;
- DB instance;
- app deploy baseline;
- bot config.
**Out of Scope:**
- auto-scaling.
**Артефакты / Deliverables:**
- stage config/docs.
**Acceptance Criteria:**
- stage separated from prod and usable for acceptance.
**Dependencies:** N-002, L-005  
**Suggested Owner:** DevOps  
**Notes / Edge Cases:**  
- separate bot config if required.

### TASK N-004
**Название:** Подготовить release process baseline  
**Цель:** Сделать релизы предсказуемыми.  
**Контекст:** Backend + multiple frontends + bot require coordinated release order.  
**In Scope:**
- release checklist;
- versioning policy;
- rollback notes;
- migration order.
**Out of Scope:**
- advanced changelog automation.
**Артефакты / Deliverables:**
- `docs/release/release_process.md`
**Acceptance Criteria:**
- team understands deploy and rollback order.
**Dependencies:** N-003, M-006  
**Suggested Owner:** Tech Lead / DevOps  
**Notes / Edge Cases:**  
- backward-incompatible migrations need explicit warning.

---

## EPIC O — Documentation / Handoff completeness

### TASK O-001
**Название:** Подготовить canonical API contracts pack  
**Цель:** Синхронизировать backend и UI через единые контракты.  
**Контекст:** Without shared contracts, frontend/backend drift quickly.  
**In Scope:**
- auth contracts;
- bootstrap contracts;
- catalog contracts;
- cart contracts;
- order contracts;
- admin contracts;
- courier contracts.
**Out of Scope:**
- public third-party integrator API docs.
**Артефакты / Deliverables:**
- `docs/api/contracts/...` or shared schema package.
**Acceptance Criteria:**
- all critical MVP flows covered by shared contracts.
**Dependencies:** C-006, E-005, F-004, F-007, G-005, J-008, K-004  
**Suggested Owner:** Backend + Frontend Leads  
**Notes / Edge Cases:**  
- version carefully.

### TASK O-002
**Название:** Подготовить ERD and architecture diagrams  
**Цель:** Дать наглядную карту системы.  
**Контекст:** Diagrams reduce onboarding and handoff confusion.  
**In Scope:**
- system context;
- backend module diagram;
- ERD for core domains;
- order lifecycle diagram;
- notification trigger map.
**Out of Scope:**
- presentation deck.
**Артефакты / Deliverables:**
- diagrams files/docs.
**Acceptance Criteria:**
- diagrams match implemented architecture and order lifecycle.
**Dependencies:** B-002, G-002, H-004  
**Suggested Owner:** Architect  
**Notes / Edge Cases:**  
- keep diagrams in sync with implementation.

### TASK O-003
**Название:** Подготовить onboarding and ops runbook  
**Цель:** Сделать проект обслуживаемым после первой сборки.  
**Контекст:** The system must be operable, not just coded.  
**In Scope:**
- onboarding guide;
- common troubleshooting;
- order incident troubleshooting;
- notification troubleshooting;
- store onboarding checklist.
**Out of Scope:**
- full SRE runbook depth.
**Артефакты / Deliverables:**
- `docs/ops/runbook.md`
- `docs/ops/store_onboarding_checklist.md`
**Acceptance Criteria:**
- new contributor can understand startup and common problem handling.
**Dependencies:** N-004, H-002  
**Suggested Owner:** Tech Lead / Ops-minded Engineer  
**Notes / Edge Cases:**  
- include “bot not sending messages” and “store not opening from deep link”.

---

# 6. Suggested parallelization

## Track 1 — Foundation
A-001 → A-002 → A-003

## Track 2 — Backend core
B-001 → B-002 → B-003 → B-004 → B-005/B-006

## Track 3 — Stores
C-001 → C-002 → C-003 → C-004 → C-005 → C-006

## Track 4 — Auth / Roles
D-001 → D-002 → D-003 → D-004 → D-005 + D-006 → D-007

## Track 5 — Catalog
E-001 → E-002 + E-003 → E-004 + E-005 + E-006 + E-007 → E-008

## Track 6 — Cart / Checkout / Orders
F-001 → F-002 + F-003 → F-004 → F-005 → F-006 → F-007 → F-008  
G-001 → G-002 → G-003 → G-004 → G-005 → G-006 → G-007 → G-008 → G-009 → G-010

## Track 7 — Notifications / Security / Audit
H-001 → H-002 + H-003 → H-004 → H-005  
L-001 → L-002  
L-003 + L-004 + L-005

## Track 8 — Mini App
I-001 → I-002 → I-003 → I-004 → I-005/I-006/I-007 → I-008 → I-009 → I-010 → I-011 → I-012

## Track 9 — Admin panel
J-001 → J-002 → J-003 → J-004/J-005/J-006 → J-007 → J-008 → J-009 → J-010

## Track 10 — Courier panel
K-001 → K-002 → K-003 → K-004 → K-005

## Track 11 — QA / Release / Docs
M-001 → M-002/M-003/M-004/M-005 → M-006  
N-001 → N-002 → N-003 → N-004  
O-001/O-002/O-003 throughout implementation

---

# 7. Backlog / not in MVP

- online payments
- payment providers
- Apple Pay / Google Pay
- delivery maps and polygons
- geocoding / geofencing
- live courier tracking
- route optimization
- automatic courier assignment
- in-app customer chat with operator
- loyalty / cashback / bonuses
- promo engine
- ERP/POS integrations
- advanced BI / analytics
- reviews and ratings
- split shipments

---

# 8. Final note

Этот файл **v2** специально сделан как рабочая декомпозиция:
- с четкими границами MVP;
- с отдельными эпиками;
- с зависимостями;
- с acceptance criteria;
- с прицелом на параллельную реализацию несколькими AI-исполнителями.

Следующий естественный артефакт после него:
- task board template с priority / size / owner type / status.
