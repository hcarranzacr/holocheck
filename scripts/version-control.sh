#!/bin/bash

# 🏷️ HoloCheck Version Control Management Script
# Manages versions, tags, and releases for the biometric rPPG system

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="HoloCheck Biometric rPPG"
CURRENT_VERSION="biometricRPPG base v1.0.0"
BACKUP_DIR=".backups"
DOCS_DIR="docs"

# Functions
print_header() {
    echo -e "${BLUE}🏷️ $PROJECT_NAME - Version Control${NC}"
    echo -e "${BLUE}================================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

# Show current version info
show_version() {
    print_header
    echo ""
    echo -e "${GREEN}📊 CURRENT VERSION INFORMATION${NC}"
    echo "================================"
    
    if [ -f "VERSION.txt" ]; then
        cat VERSION.txt
    else
        print_warning "VERSION.txt not found"
    fi
    
    echo ""
    echo -e "${BLUE}📋 GIT INFORMATION${NC}"
    echo "Current Branch: $(git branch --show-current)"
    echo "Latest Commit: $(git log -1 --format='%h - %s (%an, %ar)')"
    echo "Total Commits: $(git rev-list --count HEAD)"
    
    echo ""
    echo -e "${BLUE}📁 PROJECT STATUS${NC}"
    echo "Modified Files: $(git status --porcelain | wc -l)"
    echo "Untracked Files: $(git ls-files --others --exclude-standard | wc -l)"
}

# List all versions/tags
list_versions() {
    print_header
    echo ""
    echo -e "${GREEN}🏷️ ALL VERSIONS/TAGS${NC}"
    echo "===================="
    
    if git tag -l | grep -q .; then
        git tag -l --sort=-version:refname | while read tag; do
            commit=$(git rev-list -n 1 $tag)
            date=$(git log -1 --format="%ai" $commit)
            echo -e "${BLUE}$tag${NC} - $commit - $date"
        done
    else
        print_warning "No tags found"
    fi
    
    echo ""
    echo -e "${GREEN}📊 RECOVERY POINTS${NC}"
    echo "=================="
    echo "ac64232 - v1.0.0 biometricRPPG base (STABLE)"
    echo "e87feda - v0.9.0 Critical Fixes"
    echo "0dbfa4b - v0.8.0 Anuralogix Interface"
    echo "7a2c9f1 - v0.5.0 Biometric Analysis"
}

# Create new version
create_version() {
    local version_name=$1
    local version_type=$2
    
    if [ -z "$version_name" ]; then
        print_error "Version name is required"
        echo "Usage: $0 create <version_name> [major|minor|patch]"
        echo "Example: $0 create v1.1.0 minor"
        exit 1
    fi
    
    print_header
    echo ""
    echo -e "${GREEN}🏷️ CREATING NEW VERSION: $version_name${NC}"
    echo "========================================"
    
    # Check if working directory is clean
    if ! git diff-index --quiet HEAD --; then
        print_warning "Working directory has uncommitted changes"
        echo "Please commit or stash changes before creating a version"
        exit 1
    fi
    
    # Create backup before tagging
    create_backup "pre-version-$version_name"
    
    # Update VERSION.txt
    echo "$version_name" > VERSION.txt
    echo "Build: $(git rev-parse --short HEAD)" >> VERSION.txt
    echo "Date: $(date +%Y-%m-%d)" >> VERSION.txt
    echo "Status: RELEASE CANDIDATE" >> VERSION.txt
    
    # Commit version file
    git add VERSION.txt
    git commit -m "🏷️ VERSION: Update to $version_name"
    
    # Create annotated tag
    git tag -a "$version_name" -m "Release $version_name"
    
    print_success "Version $version_name created successfully"
    print_info "Don't forget to push the tag: git push origin $version_name"
}

# Create backup
create_backup() {
    local backup_name=$1
    local timestamp=$(date +%Y%m%d-%H%M%S)
    
    if [ -z "$backup_name" ]; then
        backup_name="manual-backup"
    fi
    
    mkdir -p "$BACKUP_DIR"
    
    print_info "Creating backup: $backup_name-$timestamp"
    
    # Create tar backup excluding unnecessary files
    tar -czf "$BACKUP_DIR/$backup_name-$timestamp.tar.gz" \
        --exclude=node_modules \
        --exclude=.git \
        --exclude=dist \
        --exclude=.backups \
        .
    
    print_success "Backup created: $BACKUP_DIR/$backup_name-$timestamp.tar.gz"
    
    # Clean old backups (keep last 10)
    ls -t "$BACKUP_DIR"/*.tar.gz 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true
}

# Rollback to specific version
rollback() {
    local target=$1
    
    if [ -z "$target" ]; then
        print_error "Target version/commit is required"
        echo "Usage: $0 rollback <version|commit>"
        echo "Example: $0 rollback v1.0.0"
        echo "Example: $0 rollback ac64232"
        exit 1
    fi
    
    print_header
    echo ""
    echo -e "${YELLOW}🔄 ROLLING BACK TO: $target${NC}"
    echo "================================"
    
    # Create backup before rollback
    create_backup "pre-rollback-$(date +%Y%m%d-%H%M%S)"
    
    # Verify target exists
    if ! git cat-file -e "$target^{commit}" 2>/dev/null; then
        print_error "Target $target does not exist"
        exit 1
    fi
    
    # Create rollback branch
    local rollback_branch="rollback-to-$target-$(date +%Y%m%d-%H%M%S)"
    git checkout -b "$rollback_branch"
    
    # Reset to target
    git reset --hard "$target"
    
    # Update VERSION.txt if it exists
    if [ -f "VERSION.txt" ]; then
        echo "ROLLBACK to $target" > VERSION.txt
        echo "Build: $(git rev-parse --short HEAD)" >> VERSION.txt
        echo "Date: $(date +%Y-%m-%d)" >> VERSION.txt
        echo "Status: ROLLBACK - NEEDS VALIDATION" >> VERSION.txt
        
        git add VERSION.txt
        git commit -m "🔄 ROLLBACK: Reset to $target"
    fi
    
    print_success "Rollback completed to $target"
    print_info "Current branch: $rollback_branch"
    print_warning "Please validate the rollback before merging to main"
}

# Validate current state
validate() {
    print_header
    echo ""
    echo -e "${GREEN}🧪 VALIDATING CURRENT STATE${NC}"
    echo "============================"
    
    local validation_errors=0
    
    # Check critical files
    local critical_files=(
        "package.json"
        "src/App.jsx"
        "src/components/BiometricCapture.jsx"
        "src/services/mediaPermissions.js"
        "src/services/rppgAnalysis.js"
        "src/services/voiceAnalysis.js"
    )
    
    echo -e "${BLUE}📁 Checking critical files...${NC}"
    for file in "${critical_files[@]}"; do
        if [ -f "$file" ]; then
            print_success "Found: $file"
        else
            print_error "Missing: $file"
            ((validation_errors++))
        fi
    done
    
    # Check if we can build
    echo ""
    echo -e "${BLUE}🔨 Testing build...${NC}"
    if command -v pnpm >/dev/null 2>&1; then
        if pnpm run build >/dev/null 2>&1; then
            print_success "Build successful"
        else
            print_error "Build failed"
            ((validation_errors++))
        fi
    else
        print_warning "pnpm not found, skipping build test"
    fi
    
    # Check git status
    echo ""
    echo -e "${BLUE}📋 Git status...${NC}"
    local modified_files=$(git status --porcelain | wc -l)
    if [ "$modified_files" -eq 0 ]; then
        print_success "Working directory clean"
    else
        print_warning "$modified_files modified files"
    fi
    
    # Final result
    echo ""
    if [ "$validation_errors" -eq 0 ]; then
        print_success "Validation passed - System is stable"
        return 0
    else
        print_error "Validation failed - $validation_errors errors found"
        return 1
    fi
}

# Compare versions
compare() {
    local version1=$1
    local version2=$2
    
    if [ -z "$version1" ] || [ -z "$version2" ]; then
        print_error "Two versions are required for comparison"
        echo "Usage: $0 compare <version1> <version2>"
        echo "Example: $0 compare v0.9.0 v1.0.0"
        exit 1
    fi
    
    print_header
    echo ""
    echo -e "${GREEN}📊 COMPARING VERSIONS${NC}"
    echo "===================="
    echo -e "${BLUE}From:${NC} $version1"
    echo -e "${BLUE}To:${NC} $version2"
    echo ""
    
    # Show commits between versions
    echo -e "${BLUE}📋 Commits between versions:${NC}"
    git log --oneline "$version1..$version2"
    
    echo ""
    echo -e "${BLUE}📈 File changes:${NC}"
    git diff --stat "$version1..$version2"
}

# Show help
show_help() {
    print_header
    echo ""
    echo -e "${GREEN}📚 AVAILABLE COMMANDS${NC}"
    echo "===================="
    echo ""
    echo -e "${BLUE}version${NC}     - Show current version information"
    echo -e "${BLUE}list${NC}        - List all versions and recovery points"
    echo -e "${BLUE}create${NC}      - Create new version tag"
    echo -e "${BLUE}backup${NC}      - Create manual backup"
    echo -e "${BLUE}rollback${NC}    - Rollback to specific version/commit"
    echo -e "${BLUE}validate${NC}    - Validate current system state"
    echo -e "${BLUE}compare${NC}     - Compare two versions"
    echo -e "${BLUE}help${NC}        - Show this help message"
    echo ""
    echo -e "${GREEN}📋 EXAMPLES${NC}"
    echo "==========="
    echo "$0 version"
    echo "$0 list"
    echo "$0 create v1.1.0 minor"
    echo "$0 backup"
    echo "$0 rollback v1.0.0"
    echo "$0 validate"
    echo "$0 compare v0.9.0 v1.0.0"
}

# Main script logic
case "${1:-help}" in
    "version"|"v")
        show_version
        ;;
    "list"|"l")
        list_versions
        ;;
    "create"|"c")
        create_version "$2" "$3"
        ;;
    "backup"|"b")
        create_backup "$2"
        ;;
    "rollback"|"r")
        rollback "$2"
        ;;
    "validate"|"val")
        validate
        ;;
    "compare"|"comp")
        compare "$2" "$3"
        ;;
    "help"|"h"|*)
        show_help
        ;;
esac