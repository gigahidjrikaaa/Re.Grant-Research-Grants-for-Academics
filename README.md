# Re.Grant: Revolutionizing Academic Research Funding with Blockchain

**Empowering Researchers, Streamlining Funding, Fostering Collaboration.**

## The Vision: A Transparent Future for Academic Grants

Re.Grant is a cutting-edge platform poised to transform the landscape of academic research funding. We are building a transparent, efficient, and accessible ecosystem specifically tailored for academics and researchers, leveraging the power of blockchain technology. Our mission is to eliminate the friction and opacity of traditional grant systems, allowing brilliant minds to focus on what truly matters: **innovation and discovery.**

## The Problem: Challenges in Traditional Research Funding

The academic world thrives on research, yet the process of securing and managing grants is often fraught with challenges:

* **Time-Consuming Processes:** Lengthy application and review cycles delay critical research.
* **Lack of Transparency:** Opaque decision-making and fund-tracking can lead to mistrust and inefficiencies.
* **Complex Administration:** Significant administrative overhead for both applicants and funding bodies.
* **Payment Delays & Inflexibility:** Milestone verification and fund disbursement can be slow and rigid.
* **Siloed Collaboration:** Difficulty in finding and connecting with potential collaborators or skilled talent within the academic community.

## Our Solution: Re.Grant - The Next Generation Grant Platform

Re.Grant addresses these challenges head-on by building a comprehensive platform on the **Lisk L2 Solution**, offering:

* **Simplified & Streamlined Grant Applications:** An intuitive interface for researchers to prepare, submit, and track their grant proposals.
* **Blockchain-Powered Transparency & Security:** All grant lifecycles, from application to funding, are recorded on the Lisk L2 blockchain, ensuring an immutable and auditable trail. Smart contracts automate key processes, enhancing trust and reducing manual intervention.
* **Efficient Milestone-Based Funding with IDRX:** Grants are disbursed in **IDRX**, an Indonesian Rupiah-pegged stablecoin, ensuring value stability and local relevance. Payouts are automatically triggered by verified milestone completions recorded on-chain.
* **Dynamic Talent Pool & Project Board:** A collaborative ecosystem where researchers can showcase their expertise, students can find research opportunities, and project leaders can recruit talent for their initiatives.
* **Secure Authentication with SIWE:** Users securely access the platform using Sign-In with Ethereum (SIWE), leveraging their existing EVM-compatible wallets.

## Why Invest in Re.Grant?

Re.Grant represents a significant step forward in how academic research is funded and managed, offering a compelling investment opportunity:

* **Innovative Edge:** We are at the forefront of applying Web3 technologies to solve real-world problems in the academic sector.
* **Targeted Market:** Focused on the specific needs of university departments and research institutions, starting with the Department of Electrical and Information Engineering, with clear potential for broader adoption.
* **Efficiency & Cost Reduction:** By automating processes and increasing transparency, Re.Grant can significantly reduce administrative costs associated with grant management.
* **Enhanced Collaboration:** The Talent Pool and Project Board features are designed to break down silos and foster a more dynamic research environment, leading to higher quality outcomes.
* **Scalable & Robust Technology:** Built on a modern and scalable tech stack (Next.js, FastAPI, PostgreSQL, Lisk L2, Docker, Kubernetes), Re.Grant is designed for growth and reliability.
* **Empowering Local Currency:** Utilization of IDRX simplifies financial management for Indonesian researchers and institutions, promoting local economic integration with cutting-edge technology.
* **Future-Proof Platform:** As Web3 adoption grows, Re.Grant positions academic institutions to be early adopters and beneficiaries of decentralized technologies.

## Key Features

* **User-Friendly Interface:** Intuitive dashboards for researchers, grant administrators, and students.
  * *(Dashboard, Grants Listing, Grant Application, Profile Management, Project Board, Talent Pool)*
* **Decentralized Grant Management:**
  * Online grant proposal submission.
  * Transparent review process (workflow can be further decentralized).
  * Automated, milestone-based fund disbursement via smart contracts using IDRX.
* **Collaboration Hub:**
  * **Talent Pool:** Researchers and students can create profiles showcasing skills and interests.
  * **Project Board:** Principal Investigators can post project needs, and talent can apply to contribute.
* **Secure User Authentication:** Sign-In with Ethereum (SIWE) for robust and user-friendly wallet-based login.
* **Comprehensive Admin Panel:**
  * Dynamic data editor for managing all platform entities (Users, Grants, Projects, Profiles, etc.).
  * Data seeding capabilities for testing and demonstration.
* **Profile Management:** Detailed user profiles including education, experience, publications, skills, and research interests.

## Platform Architecture & Technology Stack

Re.Grant is built with a focus on modern, scalable, and secure technologies:

* **Frontend:** Next.JS, Tailwind CSS, Shadcn UI, React Hook Form, Zustand
  * *Wallet Integration:* Wagmi, RainbowKit, MeshSDK (for Cardano, though Lisk is primary for grants)
* **Backend:** FastAPI (Python), SQLAlchemy
* **Database:** PostgreSQL
* **Blockchain:**
  * **Primary Grant Network:** Lisk L2 Solution (EVM Compatible)
  * **Smart Contracts:** Solidity
* **Authentication:** Sign-In with Ethereum (SIWE)
* **Development & Testing:**
  * *Local Blockchain Dev:* Foundry (as per README)
  * *Testing Frameworks:* Mocha, Chai, Jest (as per README, though implementation details not fully visible in provided code)
* **Deployment & Operations:** Docker, Kubernetes (planned, as per README)
* **Version Control:** Git, GitHub
* **CI/CD:** GitHub Actions, Travis CI (planned, as per README)
* **Monitoring:** Prometheus, Grafana (planned, as per README)

## Current Status

Re.Grant is under active development. Key functionalities include:

* **Core Backend Services:** User authentication (SIWE), CRUD operations for main entities (users, grants, projects, profiles), and a comprehensive admin API.
* **Frontend Application:** User interface for landing page, grant application, grant viewing, dashboard, profile management, project board, and talent pool.
* **Database Schema:** Well-defined schema with migrations managed by Alembic.
* **Wallet Integration:** Robust multi-wallet support for EVM (Lisk L2) and initial integration for Cardano (MeshSDK).

The "Getting Started," "Contact," and "License" sections are currently placeholders and will be updated as the project matures.

## The Opportunity Ahead

Re.Grant is more than just a platform; it's a vision for a more equitable, transparent, and collaborative research environment. We believe that by harnessing the power of blockchain, we can unlock significant value for academic institutions and the researchers who drive innovation.

We are seeking partners and investors who share our vision and are excited by the potential of Web3 technology to reshape traditional systems.

## Technical Details

### Lisk Sepolia Chain Configuration

* **Network Name:** Lisk Sepolia
* **RPC URL:** `https://rpc.sepolia-api.lisk.com`
* **Chain ID:** 4202
* **Currency Symbol:** ETH
* **Explorer URL:** `https://sepolia-blockscout.lisk.com`

### Getting Lisk Sepolia ETH (for Testing)

1. Visit the [Sepolia Faucet](https://sepolia-faucet.com).
2. Connect your wallet and request Sepolia ETH.
3. This testnet currency is for development and testing purposes only and has no real-world value.

## Getting Started (for Developers)

The project is structured with a Next.js frontend and a FastAPI backend.

1. **Prerequisites:** Docker, Node.js, Python.
2. **Clone the repository.**
3. **Setup Environment Variables:** Create `.env` files for both `frontend` and `backend` based on provided examples or `docker-compose.yml` configurations.
4. **Build & Run using Docker Compose:**

    ```bash
    docker-compose up --build
    ```

    * Frontend will be accessible at `http://localhost:3000`.
    * Backend API will be accessible at `http://localhost:8000`.

*(Refer to individual README files in `frontend` and `backend` directories for more detailed setup instructions if needed.)*

## Contact & Learn More

For inquiries, collaborations, or investment opportunities, please reach out to us at:
[Giga Hidjrika Aura Adkhy](https://linkedin.com/in/gigahidjrikaaa) (Lead Developer)

## License

MIT License (MIT)
See [LICENSE](LICENSE) for details.
