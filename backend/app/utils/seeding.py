import random
import datetime
from typing import List, Optional, Dict, Any
from faker import Faker # type: ignore
from sqlalchemy.orm import Session
from sqlalchemy import func

from app import models, schemas, crud # Assuming crud.user.create exists and is compatible
from app.core.security import get_password_hash # If you hash passwords in crud
from app.db.session import SessionLocal

fake = Faker(['id_ID', 'en_US'])

DEFAULT_DUMMY_PASSWORD = "dummySecurePassword123!"

def create_dummy_users(db: Session, count: int = 10) -> List[models.User]:
    created_users: List[models.User] = []
    roles = list(models.UserRole) # Get all enum members
    
    guaranteed_roles = roles[:]
    
    for i in range(count):
        email = fake.unique.email() # email can be optional in the model, but UserCreate might require it.
                                  # If UserCreate allows optional email, this is fine.
                                  # If UserCreate requires email, ensure it's always generated.
        current_role = guaranteed_roles.pop(0) if guaranteed_roles else random.choice(roles)

        # Ensure wallet_address is always generated as it's required
        wallet_addr = f"0x{fake.hexify(text='^'*40)}"

        user_in_create = schemas.UserCreate(
            # If email is truly optional in UserCreate and User model, you can make it sometimes None:
            email=email if random.choice([True, True, False]) else None, 
            # email=email, # Assuming UserCreate requires email or it's fine to always provide one for seeding
            password=DEFAULT_DUMMY_PASSWORD,
            full_name=fake.name(),
            role=current_role,
            is_active=True,
            is_superuser=(current_role == models.UserRole.ADMIN),
            wallet_address=wallet_addr # Always provide a wallet_address
        )
        try:
            # Use your CRUD operation for creating users, which should handle password hashing
            user = crud.user.create_user(db=db, user_in=user_in_create) # Adjust if method name differs
            created_users.append(user)
        except Exception as e:
            print(f"Could not create user {email}: {e}")
            db.rollback() # Rollback for this user only
    fake.unique.clear()
    db.commit() # Commit all users at once
    return created_users

def create_dummy_profiles_with_details(db: Session, users: List[models.User]) -> List[models.Profile]:
    created_profiles: List[models.Profile] = []
    for user in users:
        if user.role == models.UserRole.ADMIN:
            continue
        if db.query(models.Profile).filter(models.Profile.user_id == user.id).first():
            continue

        profile_data = {
            "user_id": user.id,
            "avatar_url": fake.image_url() if random.choice([True, False]) else None,
            "current_role": fake.job() if user.role != models.UserRole.STUDENT else "Student",
            "headline": fake.bs().title(),
            "linkedin_url": f"https://linkedin.com/in/{fake.slug()}" if random.choice([True, False]) else None,
            "github_url": f"https://github.com/{fake.slug()}" if random.choice([True, False]) else None,
            "website_url": fake.url() if random.choice([True, False]) else None,
            "orcid_id": fake.bothify(text="????-????-????-????") if user.role == models.UserRole.RESEARCHER else None,
            "about": fake.paragraph(nb_sentences=random.randint(3, 7)),
            "skills": fake.words(nb=random.randint(3, 6), unique=True),
            "research_interests": fake.words(nb=random.randint(2, 5), unique=True) if user.role != models.UserRole.INSTITUTION and random.choice([True,True,False]) else None, # MODIFIED
            "is_visible_in_talent_pool": random.choice([True, False])
        }
        profile = models.Profile(**profile_data)
        db.add(profile)
        db.flush() # Get profile.id

        # Experiences
        for _ in range(random.randint(0, 3)):
            start_date_exp = fake.date_between(start_date='-10y', end_date='-1y')
            end_date_exp = fake.date_between(start_date=start_date_exp, end_date='today') if random.choice([True, True, False]) else None
            if end_date_exp and end_date_exp <= start_date_exp:
                end_date_exp = start_date_exp + datetime.timedelta(days=random.randint(180, 730))
            db.add(models.Experience(
                profile_id=profile.id, title=fake.job(), institution=fake.company(), # MODIFIED company to institution
                start_date=start_date_exp, end_date=end_date_exp, description=fake.paragraph(nb_sentences=2)
            ))
        # Education
        for _ in range(random.randint(1, 2)):
            grad_date = fake.date_between(start_date='-8y', end_date='-1y')
            education_data = { # MODIFIED to build dict first for clarity
                "profile_id": profile.id,
                "degree": random.choice(["Bachelor's", "Master's", "PhD"]),
                "institution": f"{fake.last_name()} University", # MODIFIED institution_name to institution
                "major": fake.bs().title(), # Model has major
                "graduation_date": grad_date, # Model has graduation_date
                "description": fake.sentence()
            }
            # Removed: field_of_study, end_date, start_date as they are not in the current Education model
            db.add(models.Education(**education_data))
        created_profiles.append(profile)
    db.commit()
    return created_profiles

def create_dummy_publications(db: Session, profiles: List[models.Profile], pubs_per_profile_avg: int = 2) -> List[models.Publication]:
    created_publications: List[models.Publication] = []
    researcher_profiles = [p for p in profiles if p.user and p.user.role in [models.UserRole.RESEARCHER, models.UserRole.STUDENT]]
    for profile in researcher_profiles:
        num_pubs = random.randint(0, int(pubs_per_profile_avg * 1.5) + 1)
        for _ in range(num_pubs):
            authors = [profile.user.full_name] if profile.user and profile.user.full_name else [fake.name()]
            authors.extend([fake.name() for _ in range(random.randint(0, 3))])
            pub_data = {
                "profile_id": profile.id,
                "title": fake.sentence(nb_words=random.randint(5, 10)).replace('.', ''),
                "authors": authors,
                "venue": random.choice([f"Journal of {fake.bs().title()}", f"Conference on {fake.catch_phrase()}"]),
                "year": int(fake.year()),
                "link": fake.url() if random.choice([True, False]) else None,
                "abstract": fake.paragraph(nb_sentences=random.randint(3, 6))
            }
            publication_obj = models.Publication(**pub_data) # MODIFIED
            db.add(publication_obj) # MODIFIED
            created_publications.append(publication_obj) # MODIFIED
    db.commit()
    return created_publications

def create_dummy_grants(db: Session, proposer_users: List[models.User], count: int = 5) -> List[models.Grant]:
    created_grants: List[models.Grant] = []
    if not proposer_users: return []
    for _ in range(count):
        grant_data = {
            "title": f"{fake.bs().title()} Grant for {fake.catch_phrase()}",
            "description": fake.paragraph(nb_sentences=random.randint(5, 12)),
            "proposer_id": random.choice(proposer_users).id,
            "status": random.choice(list(models.GrantStatus)),
            "grant_type": random.choice(list(models.GrantType)),
            "total_funding_requested": random.uniform(10000, 250000),
            "funding_currency": random.choice(["IDRX", "USD", "IDR"]),
            "application_start_date": fake.date_time_this_year(before_now=True, after_now=False),
            "application_deadline": fake.date_time_this_year(before_now=False, after_now=True),
            "start_date_expected": fake.date_object(),
            "end_date_expected": fake.date_object(),
            "eligibility_criteria": fake.text(max_nb_chars=200),
            "website_link": fake.url() if random.choice([True, False]) else None,
            "talent_requirements": {"roles_needed": fake.words(nb=2), "skills": ", ".join(fake.words(nb=random.randint(2, 4), unique=True)),}
        }
        grant = models.Grant(**grant_data)
        db.add(grant)
        db.flush()
        # Milestones
        for i in range(random.randint(1, 4)):
            db.add(models.GrantMilestone(
                grant_id=grant.id, title=f"Milestone {i+1}: {fake.catch_phrase()}",
                amount_allocated=grant.total_funding_requested / (i + random.randint(2,5)) if grant.total_funding_requested else random.uniform(1000,20000),
                due_date=fake.date_between(start_date='+30d', end_date='+1y'), order=i
            ))
        created_grants.append(grant)
    db.commit()
    return created_grants

def create_dummy_projects(db: Session, creator_users: List[models.User], grants: List[models.Grant], count: int = 7) -> List[models.Project]:
    created_projects: List[models.Project] = []
    if not creator_users: return []
    for _ in range(count):
        project_data = {
            "title": f"Project {fake.bs().title()}: {fake.catch_phrase()}",
            "description": fake.paragraph(nb_sentences=random.randint(7, 15)),
            "creator_id": random.choice(creator_users).id,
            "status": random.choice(list(models.ProjectStatus)),
            "category": random.choice(list(models.ProjectCategory)),
            "expected_duration": f"{random.randint(2,12)} months",
            "required_skills": fake.words(nb=random.randint(4, 6), unique=True), # MODIFIED to list
            "roles_available": {"lead_researcher": fake.name(), "positions": random.randint(1,3)},
            "budget": random.uniform(5000, 100000) if random.choice([True, False]) else None,
            "grant_id": random.choice(grants).id if grants and random.choice([True, False, False]) else None,
        }
        project = models.Project(**project_data)
        db.add(project)
        db.flush()
        # Project Members
        members_to_add = random.sample(creator_users, k=min(len(creator_users), random.randint(0,4)))
        for member_user in members_to_add:
            if member_user.id != project.creator_id: # Creator is implicitly involved
                 # Check if already a member
                if not db.query(models.ProjectTeamMember).filter_by(project_id=project.id, user_id=member_user.id).first():
                    db.add(models.ProjectTeamMember(
                        project_id=project.id, user_id=member_user.id,
                        role_in_project=random.choice(["Developer", "Researcher", "Analyst", "Advisor"])
                    ))
        created_projects.append(project)
    db.commit()
    return created_projects

def create_dummy_grant_applications(db: Session, grants: List[models.Grant], applicant_users: List[models.User], apps_per_grant_avg: int = 3) -> List[models.GrantApplication]:
    created_applications: List[models.GrantApplication] = []
    if not grants or not applicant_users: return []
    for grant_item in grants:
        num_apps = random.randint(0, int(apps_per_grant_avg * 1.5) +1)
        selected_applicants = random.sample(applicant_users, k=min(len(applicant_users), num_apps))
        for applicant in selected_applicants:
            if db.query(models.GrantApplication).filter_by(grant_id=grant_item.id, applicant_id=applicant.id).first():
                continue
            app_data = {
                "grant_id": grant_item.id, "applicant_id": applicant.id,
                "cover_letter": fake.paragraph(nb_sentences=random.randint(5,10)),
                "status": random.choice(list(models.GrantApplicationStatus)),
                "submitted_at": fake.date_time_this_year(before_now=True, after_now=False)
            }
            application_obj = models.GrantApplication(**app_data) # MODIFIED
            db.add(application_obj) # MODIFIED
            created_applications.append(application_obj) # MODIFIED
    db.commit()
    return created_applications

def create_dummy_project_applications(db: Session, projects: List[models.Project], applicant_users: List[models.User], apps_per_project_avg: int = 2) -> List[models.ProjectApplication]:
    created_applications: List[models.ProjectApplication] = []
    if not projects or not applicant_users: return []
    for project_item in projects:
        num_apps = random.randint(0, int(apps_per_project_avg * 1.5)+1)
        selected_applicants = random.sample(applicant_users, k=min(len(applicant_users), num_apps))
        for applicant in selected_applicants:
            if db.query(models.ProjectApplication).filter_by(project_id=project_item.id, user_id=applicant.id).first():
                continue
            # Ensure applicant is not already a member of this project
            if db.query(models.ProjectTeamMember).filter_by(project_id=project_item.id, user_id=applicant.id).first():
                continue

            app_data = {
                "project_id": project_item.id, "user_id": applicant.id,
                "cover_letter": fake.paragraph(nb_sentences=random.randint(4,8)),
                "status": random.choice(list(models.ProjectApplicationStatus)),
                "application_date": fake.date_object()
            }
            application_obj = models.ProjectApplication(**app_data) # MODIFIED
            db.add(application_obj) # MODIFIED
            created_applications.append(application_obj) # MODIFIED
    db.commit()
    return created_applications

def seed_all_sample_data(db: Session, 
                        num_users: int = 20, 
                        num_grants: int = 8, 
                        num_projects: int = 12,
                        pubs_per_profile_avg: int = 2,
                        apps_per_grant_avg: int = 3,
                        apps_per_project_avg: int = 2
                        ) -> Dict[str, Any]:
    print("Starting comprehensive data seeding...")

    users = create_dummy_users(db, count=num_users)
    if not users: return {"message": "Failed to create users, seeding aborted."}
    
    researcher_student_users = [
        u for u in users if u.role.value in [
            models.UserRole.RESEARCHER.value, 
            models.UserRole.STUDENT.value
        ]
    ]
    potential_proposers_creators = [
        u for u in users if u.role.value in [
            models.UserRole.RESEARCHER.value, 
            models.UserRole.INSTITUTION.value, 
            models.UserRole.ADMIN.value
        ]
    ]
    if not potential_proposers_creators: potential_proposers_creators = users # fallback

    profiles = create_dummy_profiles_with_details(db, users=users)
    publications = create_dummy_publications(db, profiles=profiles, pubs_per_profile_avg=pubs_per_profile_avg)
    grants = create_dummy_grants(db, proposer_users=potential_proposers_creators, count=num_grants)
    projects = create_dummy_projects(db, creator_users=potential_proposers_creators, grants=grants, count=num_projects)
    
    grant_applications = create_dummy_grant_applications(db, grants=grants, applicant_users=researcher_student_users, apps_per_grant_avg=apps_per_grant_avg)
    project_applications = create_dummy_project_applications(db, projects=projects, applicant_users=researcher_student_users, apps_per_project_avg=apps_per_project_avg)

    print("Comprehensive data seeding completed.")
    return {
        "users_created": len(users),
        "profiles_created": len(profiles),
        "publications_created": len(publications),
        "grants_created": len(grants),
        "projects_created": len(projects),
        "grant_applications_created": len(grant_applications),
        "project_applications_created": len(project_applications),
    }

if __name__ == "__main__":
    print("Running seeding script directly...")
    db_session = SessionLocal()
    try:
        results = seed_all_sample_data(db_session)
        print("\nSeeding Results:")
        for key, value in results.items():
            print(f"- {key.replace('_', ' ').capitalize()}: {value}")
    except Exception as e_main:
        print(f"An error occurred during seeding: {e_main}")
        db_session.rollback()
    finally:
        db_session.close()
    print("Seeding script finished.")