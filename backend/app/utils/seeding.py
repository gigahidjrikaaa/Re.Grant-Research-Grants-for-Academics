# backend/app/utils/seeding.py
import random
import datetime
from typing import List, Optional
from faker import Faker # type: ignore
from sqlalchemy.orm import Session
from sqlalchemy import func # For random ordering if needed

from app import models, schemas, crud
from app.core.security import get_password_hash
from app.db.session import SessionLocal # For standalone script testing if needed

fake = Faker(['id_ID', 'en_US']) # Indonesian and English locales for variety

DEFAULT_DUMMY_PASSWORD = "dummySecurePassword123!"

def create_dummy_users(db: Session, count: int = 10) -> List[models.User]:
    created_users: List[models.User] = []
    roles = [models.UserRole.RESEARCHER, models.UserRole.STUDENT, models.UserRole.INSTITUTION, models.UserRole.ADMIN]
    
    # Ensure at least one of each role for smaller counts, then random for the rest
    guaranteed_roles = roles[:]
    
    for i in range(count):
        email = fake.unique.email()
        
        current_role = None
        if guaranteed_roles:
            current_role = guaranteed_roles.pop(0)
        else:
            current_role = random.choice(roles)

        user_in = schemas.UserCreate(
            email=email,
            password=DEFAULT_DUMMY_PASSWORD,
            full_name=fake.name(),
            role=current_role,
            is_active=True,
            is_superuser=(current_role == models.UserRole.ADMIN), # Admins are superusers
            wallet_address=f"0x{fake.hexify(text='^'*40)}" if random.choice([True, False]) else None
        )
        try:
            user = crud.user.create(db=db, obj_in=user_in)
            created_users.append(user)
        except Exception as e:
            print(f"Could not create user {email}: {e}")
            db.rollback()
    fake.unique.clear()
    return created_users

def create_dummy_experiences(db: Session, profile_id: int, count: int = 2) -> List[models.Experience]:
    experiences = []
    for _ in range(count):
        start_date = fake.date_between(start_date='-10y', end_date='-1y')
        end_date = None
        if random.choice([True, True, False]): # Higher chance of having an end date
            end_date = fake.date_between(start_date=start_date, end_date='today')
            if end_date <= start_date : # ensure end_date is after start_date
                 end_date = start_date + datetime.timedelta(days=random.randint(30,1000))


        exp = models.Experience(
            profile_id=profile_id,
            title=fake.job(),
            company=fake.company(),
            location=fake.city(),
            start_date=start_date,
            end_date=end_date,
            description=fake.paragraph(nb_sentences=3)
        )
        experiences.append(exp)
    return experiences

def create_dummy_education(db: Session, profile_id: int, count: int = 1) -> List[models.Education]:
    educations = []
    for _ in range(count):
        start_date = fake.date_between(start_date='-12y', end_date='-4y')
        end_date = fake.date_between(start_date=start_date, end_date='-1y')
        if end_date <= start_date:
            end_date = start_date + datetime.timedelta(days=random.randint(365*2, 365*4))

        edu = models.Education(
            profile_id=profile_id,
            institution_name=fake.company() + " University", # More academic
            degree=random.choice(["Bachelor's", "Master's", "PhD"]) + " in " + fake.bs().title(),
            field_of_study=fake.bs().title(),
            start_date=start_date,
            end_date=end_date,
            description=fake.paragraph(nb_sentences=2)
        )
        educations.append(edu)
    return educations

def create_dummy_profiles(db: Session, users: List[models.User]) -> List[models.Profile]:
    created_profiles: List[models.Profile] = []
    for user in users:
        if user.role == models.UserRole.ADMIN: # Admins typically don't have public profiles
            continue

        existing_profile = db.query(models.Profile).filter(models.Profile.user_id == user.id).first()
        if existing_profile:
            created_profiles.append(existing_profile) # Consider it "created" for further use
            continue

        profile = models.Profile(
            user_id=user.id,
            headline=f"{fake.job()} at {fake.company()}" if user.role != models.UserRole.STUDENT else f"Student of {fake.bs().title()}",
            bio=fake.paragraph(nb_sentences=random.randint(3, 7)),
            skills=", ".join(fake.words(nb=random.randint(4, 8), unique=True)),
            website=fake.url() if random.choice([True, False, False]) else None,
            linkedin_url=f"https://linkedin.com/in/{fake.slug()}" if random.choice([True, True, False]) else None,
            github_url=f"https://github.com/{fake.slug()}" if random.choice([True, False]) else None,
        )
        db.add(profile)
        db.flush() # Flush to get profile.id for related items

        # Add experiences and education
        experiences = create_dummy_experiences(db, profile_id=profile.id, count=random.randint(0,3))
        for exp in experiences:
            db.add(exp)
        
        education_entries = create_dummy_education(db, profile_id=profile.id, count=random.randint(1,2))
        for edu in education_entries:
            db.add(edu)
            
        created_profiles.append(profile)
    
    db.commit() # Commit all profiles and their sub-entities together
    for profile in created_profiles:
        if profile.id: # Only refresh if it's a new profile persisted
             db.refresh(profile)
    return created_profiles

def create_dummy_publications(db: Session, profiles: List[models.Profile], pubs_per_profile_avg: int = 2) -> List[models.Publication]:
    created_publications: List[models.Publication] = []
    researcher_profiles = [p for p in profiles if p.user and (p.user.role == models.UserRole.RESEARCHER or p.user.role == models.UserRole.STUDENT)]

    for profile in researcher_profiles:
        for _ in range(random.randint(0, pubs_per_profile_avg * 2)): # Variable number of pubs
            publication = models.Publication(
                profile_id=profile.id,
                title=fake.sentence(nb_words=random.randint(6, 12)).replace('.', ''),
                authors=[profile.user.full_name] + [fake.name() for _ in range(random.randint(0, 3))],
                venue=random.choice([
                    f"Proceedings of the {fake.word().capitalize()} Conference on {fake.bs()}",
                    f"Journal of {fake.bs().title()}",
                    "arXiv preprint"
                ]),
                year=int(fake.year()),
                link=fake.url() if random.choice([True, False]) else None,
                abstract=fake.paragraph(nb_sentences=random.randint(4, 8))
            )
            db.add(publication)
            created_publications.append(publication)
    db.commit()
    for pub in created_publications:
        db.refresh(pub)
    return created_publications

def create_dummy_grants(db: Session, funder_users: List[models.User], count: int = 5) -> List[models.Grant]:
    created_grants: List[models.Grant] = []
    if not funder_users:
        return []

    for _ in range(count):
        application_start_date = fake.date_time_between(start_date='-30d', end_date='+30d')
        application_deadline = fake.date_time_between(start_date=application_start_date, end_date='+90d')
        if application_deadline <= application_start_date:
            application_deadline = application_start_date + datetime.timedelta(days=random.randint(30,90))

        grant = models.Grant(
            title=f"{fake.bs().title()} Research Grant",
            description=fake.paragraph(nb_sentences=random.randint(5, 10)),
            funder_id=random.choice(funder_users).id,
            amount_awarded=random.uniform(5000, 100000),
            currency="USD",
            application_deadline=application_deadline,
            application_start_date=application_start_date,
            eligibility_criteria=fake.text(max_nb_chars=300),
            grant_type=random.choice(list(models.GrantType)),
            website_link=fake.url() if random.choice([True, False]) else None,
        )
        db.add(grant)
        created_grants.append(grant)
    db.commit()
    for grant_item in created_grants:
        db.refresh(grant_item)
    return created_grants

def create_dummy_projects(db: Session, creator_users: List[models.User], count: int = 7) -> List[models.Project]:
    created_projects: List[models.Project] = []
    if not creator_users:
        return []

    for _ in range(count):
        start_date = fake.date_object()
        end_date = fake.date_between(start_date=start_date, end_date='+2y')
        if end_date <= start_date:
            end_date = start_date + datetime.timedelta(days=random.randint(90, 365*2))
        
        creator = random.choice(creator_users)
        project = models.Project(
            title=f"Project: {fake.catch_phrase()}",
            description=fake.paragraph(nb_sentences=random.randint(8, 15)),
            category=random.choice(list(models.ProjectCategory)),
            status=random.choice(["Open", "In Progress", "Completed"]), # Assuming simple string status
            start_date=start_date,
            end_date=end_date,
            budget=random.uniform(1000, 50000) if random.choice([True, False]) else None,
            required_skills=", ".join(fake.words(nb=random.randint(3,6), unique=True)),
            created_by_user_id=creator.id,
            # research_goals=fake.text(max_nb_chars=400) # Add if this field exists in model
        )
        db.add(project)
        db.flush() # Get project.id

        # Add team members (including the creator)
        team_members_to_add = random.sample(creator_users, k=min(len(creator_users), random.randint(0, 4)))
        current_members = {creator.id} # Creator is implicitly a member or lead

        for member_user in team_members_to_add:
            if member_user.id not in current_members:
                team_member_role = random.choice(["Lead Researcher", "Developer", "Analyst", "Member"])
                project_member_assoc = models.ProjectTeamMember(
                    project_id=project.id, 
                    user_id=member_user.id, 
                    role_in_project=team_member_role
                )
                db.add(project_member_assoc)
                current_members.add(member_user.id)

        created_projects.append(project)
    db.commit()
    for proj in created_projects:
        db.refresh(proj)
    return created_projects

def create_dummy_grant_applications(db: Session, grants: List[models.Grant], applicant_users: List[models.User], apps_per_grant_avg: int = 3) -> List[models.GrantApplication]:
    created_applications: List[models.GrantApplication] = []
    if not grants or not applicant_users:
        return []

    for grant_item in grants:
        for _ in range(random.randint(0, apps_per_grant_avg * 2)):
            applicant = random.choice(applicant_users)
            # Check if user already applied for this grant
            existing_app = db.query(models.GrantApplication).filter_by(grant_id=grant_item.id, user_id=applicant.id).first()
            if existing_app:
                continue

            application = models.GrantApplication(
                grant_id=grant_item.id,
                user_id=applicant.id,
                proposal=fake.paragraph(nb_sentences=random.randint(10, 20)),
                status=random.choice(list(models.ApplicationStatus)),
                application_date=fake.date_time_between(start_date=grant_item.application_start_date, end_date=grant_item.application_deadline) if grant_item.application_start_date and grant_item.application_deadline and grant_item.application_start_date < grant_item.application_deadline else fake.date_time_this_year(before_now=True, after_now=False),
            )
            db.add(application)
            created_applications.append(application)
    db.commit()
    for app in created_applications:
        db.refresh(app)
    return created_applications

def create_dummy_project_applications(db: Session, projects: List[models.Project], applicant_users: List[models.User], apps_per_project_avg: int = 2) -> List[models.ProjectApplication]:
    created_applications: List[models.ProjectApplication] = []
    if not projects or not applicant_users:
        return []

    for project_item in projects:
        for _ in range(random.randint(0, apps_per_project_avg * 2)):
            applicant = random.choice(applicant_users)
            # Check if user already applied for this project
            existing_app = db.query(models.ProjectApplication).filter_by(project_id=project_item.id, user_id=applicant.id).first()
            if existing_app:
                continue
            
            # Check if applicant is already a team member
            is_team_member = db.query(models.ProjectTeamMember).filter_by(project_id=project_item.id, user_id=applicant.id).first()
            if is_team_member:
                continue


            application = models.ProjectApplication(
                project_id=project_item.id,
                user_id=applicant.id,
                cover_letter=fake.paragraph(nb_sentences=random.randint(5,10)),
                status=random.choice(list(models.ApplicationStatus)),
                application_date=fake.date_time_this_year(before_now=True, after_now=False),
            )
            db.add(application)
            created_applications.append(application)
    db.commit()
    for app in created_applications:
        db.refresh(app)
    return created_applications

# --- Main Seeding Orchestration ---
def seed_all_basic_data(db: Session, 
                        num_users: int = 20, 
                        num_grants: int = 8, 
                        num_projects: int = 12,
                        pubs_per_profile_avg: int = 2,
                        apps_per_grant_avg: int = 3,
                        apps_per_project_avg: int = 2
                        ):
    print("Starting to seed basic data...")

    # 1. Create Users
    users = create_dummy_users(db, count=num_users)
    print(f"Created {len(users)} users.")
    if not users:
        print("No users created, stopping seeding.")
        return {}

    admin_users = [u for u in users if u.role == models.UserRole.ADMIN]
    institution_users = [u for u in users if u.role == models.UserRole.INSTITUTION]
    researcher_student_users = [u for u in users if u.role in [models.UserRole.RESEARCHER, models.UserRole.STUDENT]]
    
    # Funders can be admins or institutions
    potential_funders = admin_users + institution_users
    if not potential_funders: # if no admin/institution, pick any user as funder
        potential_funders = users 

    # 2. Create Profiles (for non-admins), including Experience and Education
    profiles = create_dummy_profiles(db, users=users) # create_dummy_profiles handles non-admin filtering
    print(f"Created {len(profiles)} profiles (with experience & education).")

    # 3. Create Publications (for profiles of researchers/students)
    publications = []
    if profiles:
        publications = create_dummy_publications(db, profiles=profiles, pubs_per_profile_avg=pubs_per_profile_avg)
        print(f"Created {len(publications)} publications.")

    # 4. Create Grants (funded by admins/institutions)
    grants = create_dummy_grants(db, funder_users=potential_funders, count=num_grants)
    print(f"Created {len(grants)} grants.")

    # 5. Create Projects (created by any user, team members added)
    projects = create_dummy_projects(db, creator_users=users, count=num_projects)
    print(f"Created {len(projects)} projects (with team members).")
    
    # 6. Create Grant Applications
    grant_applications = []
    if grants and researcher_student_users:
        grant_applications = create_dummy_grant_applications(db, grants=grants, applicant_users=researcher_student_users, apps_per_grant_avg=apps_per_grant_avg)
        print(f"Created {len(grant_applications)} grant applications.")

    # 7. Create Project Applications
    project_applications = []
    if projects and researcher_student_users:
        project_applications = create_dummy_project_applications(db, projects=projects, applicant_users=researcher_student_users, apps_per_project_avg=apps_per_project_avg)
        print(f"Created {len(project_applications)} project applications.")

    print("Basic data seeding completed.")
    return {
        "users_created": len(users),
        "profiles_created": len(profiles),
        "publications_created": len(publications),
        "grants_created": len(grants),
        "projects_created": len(projects),
        "grant_applications_created": len(grant_applications),
        "project_applications_created": len(project_applications),
    }

# Example of how to run this for testing (optional)
if __name__ == "__main__":
    print("Running seeding script directly...")
    db = SessionLocal()
    try:
        # Clear existing data (BE VERY CAREFUL WITH THIS IN A REAL SCENARIO)
        # This is for development convenience only.
        # input("About to delete existing data from some tables. Press Enter to continue or Ctrl+C to abort...")
        # for table in reversed(models.Base.metadata.sorted_tables):
        #     if table.name not in ["alembic_version"]: # Don't delete alembic history
        #         db.execute(table.delete())
        # db.commit()
        # print("Existing data cleared (excluding alembic_version).")

        results = seed_all_basic_data(db)
        print("\nSeeding Results:")
        for key, value in results.items():
            print(f"- {key.replace('_', ' ').capitalize()}: {value}")
    except Exception as e:
        print(f"An error occurred during seeding: {e}")
        db.rollback()
    finally:
        db.close()
    print("Seeding script finished.")