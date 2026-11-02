package com.careerguidance.dto;

public class SkillDto {
    private String id;
    private String name;
    private String skillName;
    private String category;
    private String proficiency; // Beginner, Intermediate, Advanced

    public SkillDto() {}

    public SkillDto(String id, String name, String category, String proficiency) {
        this.id = id;
        this.name = name;
        this.skillName = name;
        this.category = category;
        this.proficiency = proficiency;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getName() { 
        return name != null ? name : skillName; 
    }
    public void setName(String name) { 
        this.name = name;
        if (this.skillName == null) this.skillName = name;
    }

    public String getSkillName() { 
        return skillName != null ? skillName : name; 
    }
    public void setSkillName(String skillName) { 
        this.skillName = skillName;
        if (this.name == null) this.name = skillName;
    }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getProficiency() { return proficiency; }
    public void setProficiency(String proficiency) { this.proficiency = proficiency; }
}
