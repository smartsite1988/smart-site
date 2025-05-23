"""Add training matrix models

Revision ID: 1bd619a3e239
Revises: 4f402901fe6f
Create Date: 2025-04-07 11:37:25.671871

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '1bd619a3e239'
down_revision = '4f402901fe6f'
branch_labels = None
depends_on = None


def upgrade():
    op.execute('DROP TABLE IF EXISTS certificate CASCADE')
    op.execute('DROP TABLE IF EXISTS operative CASCADE')
    op.execute('DROP TABLE IF EXISTS organization CASCADE')
    # Then recreate the tables as needed

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('certificate',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('operative_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('certificate_name', sa.VARCHAR(length=200), autoincrement=False, nullable=False),
    sa.Column('issued_date', sa.DATE(), autoincrement=False, nullable=True),
    sa.Column('expiry_date', sa.DATE(), autoincrement=False, nullable=True),
    sa.Column('front_image_path', sa.VARCHAR(length=255), autoincrement=False, nullable=True),
    sa.Column('back_image_path', sa.VARCHAR(length=255), autoincrement=False, nullable=True),
    sa.Column('uploaded_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['operative_id'], ['operative.id'], name='certificate_operative_id_fkey'),
    sa.PrimaryKeyConstraint('id', name='certificate_pkey')
    )
    op.create_table('organization',
    sa.Column('id', sa.INTEGER(), server_default=sa.text("nextval('organization_id_seq'::regclass)"), autoincrement=True, nullable=False),
    sa.Column('name', sa.VARCHAR(length=100), autoincrement=False, nullable=False),
    sa.Column('firebase_uid', sa.VARCHAR(length=255), autoincrement=False, nullable=False),
    sa.Column('created_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=True),
    sa.PrimaryKeyConstraint('id', name='organization_pkey'),
    sa.UniqueConstraint('firebase_uid', name='organization_firebase_uid_key'),
    sa.UniqueConstraint('name', name='organization_name_key'),
    postgresql_ignore_search_path=False
    )
    op.create_table('operative',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('organization_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('name', sa.VARCHAR(length=100), autoincrement=False, nullable=False),
    sa.Column('card_number', sa.VARCHAR(length=100), autoincrement=False, nullable=True),
    sa.Column('created_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['organization_id'], ['organization.id'], name='operative_organization_id_fkey'),
    sa.PrimaryKeyConstraint('id', name='operative_pkey'),
    sa.UniqueConstraint('card_number', name='operative_card_number_key')
    )
    # ### end Alembic commands ###
