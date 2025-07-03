import React, { useContext, useEffect, useState } from 'react';
import { Card, Row, Col, Form, Button, Container } from 'react-bootstrap';
import { UserContext } from '../Context/UserContext';
import TitleHead from '../Custom Hooks/TitleHead';
import { useNavigate, useParams } from 'react-router';
import { App } from 'antd';
import axios from 'axios';
import Select from 'react-select';
import { API_URL } from '../../config/api';

// Add IIIB to tallySheetOptions
const tallySheetOptions = [
  { value: 'IA', label: 'IA' },
  { value: 'IB', label: 'IB' },
  { value: 'IIA', label: 'IIA' },
  { value: 'IIB', label: 'IIB' },
  { value: 'IIIA', label: 'IIIA' },
  { value: 'IIIB', label: 'IIIB' },
  { value: 'IVA', label: 'IVA' }, 
  { value: 'IVB', label: 'IVB' },
];

// Common section options (for both IA and IB)
const commonSectionOptions = [
  { value: 'typodont', label: 'Typodont' },
  { value: 'scaling_and_polishing', label: 'Scaling and Polishing' },
  { value: 'prosthodontics', label: 'Prosthodontics' },
  { value: 'restorative_dentistry', label: 'Restorative Dentistry' },
  { value: 'penalty', label: 'Penalty' },
];

// IA Section options
const iaSectionOptions = commonSectionOptions;

// IB Section options
const ibSectionOptions = commonSectionOptions;

// IIA Section options
const iiaSectionOptions = [
  { value: 'typodont', label: 'Typodont' },
  { value: 'scaling_and_polishing', label: 'Scaling and Polishing' },
  { value: 'oral_surgery', label: 'Oral Surgery' },
  { value: 'oral_diagnosis', label: 'Oral Diagnosis' },
  { value: 'endodontics', label: 'Endodontics' },
  { value: 'prosthodontics', label: 'Prosthodontics' },
  { value: 'restorative_dentistry', label: 'Restorative Dentistry' },
  { value: 'penalty', label: 'Penalty' },
];

// IIB Section options
const iibSectionOptions = [
  { value: 'typodont', label: 'Typodont' },
  { value: 'scaling_and_polishing', label: 'Scaling and Polishing' },
  { value: 'oral_surgery', label: 'Oral Surgery' },
  { value: 'oral_diagnosis', label: 'Oral Diagnosis' },
  { value: 'prosthodontics', label: 'Prosthodontics' },
  { value: 'restorative_dentistry', label: 'Restorative Dentistry' },
  { value: 'penalty', label: 'Penalty' },
];

// IIIA Section options
const iiiaSectionOptions = [
  { value: 'typodont', label: 'Typodont' },
  { value: 'scaling_and_polishing', label: 'Scaling and Polishing' },
  { value: 'oral_surgery', label: 'Oral Surgery' },
  { value: 'oral_diagnosis', label: 'Oral Diagnosis' },
  { value: 'endodontics', label: 'Endodontics' },
  { value: 'prosthodontics', label: 'Prosthodontics' },
  { value: 'restorative_dentistry', label: 'Restorative Dentistry' },
  { value: 'penalty', label: 'Penalty' },
];

// IA - Typodont case options
const iaTypodontCaseOptions = [
  { value: 'class2_max_prep_co_1', label: 'Class 2 Maxillary Preparation and CO - Case 1' },
  { value: 'class2_max_prep_co_2', label: 'Class 2 Maxillary Preparation and CO - Case 2' },
  { value: 'class2_mand_prep_co_1', label: 'Class 2 Mandibular Preparation and CO - Case 1' },
  { value: 'class2_mand_prep_co_2', label: 'Class 2 Mandibular Preparation and CO - Case 2' },
  { value: 'class1_am_prep_1', label: 'Class 1 Amalgam Preparation - Case 1' },
  { value: 'class1_am_prep_2', label: 'Class 1 Amalgam Preparation - Case 2' },
  { value: 'class2_am_prep_1', label: 'Class 2 Amalgam Preparation - Case 1' },
  { value: 'class1_prep_co', label: 'Class 1 Preparation and CO - Case 1' },
  { value: 'class2_prep_co', label: 'Class 2 Preparation and CO - Case 1' },
  { value: 'maxillary_anterior', label: 'Fixed Partial Denture: Maxillary Anterior - Case 1' },
  { value: 'maxillary_posterior', label: 'Fixed Partial Denture: Maxillary Posterior - Case 1' },
  { value: 'mandibular_anterior', label: 'Fixed Partial Denture - Mandibular Anterior' },
  { value: 'mandibular_posterior', label: 'Fixed Partial Denture - Mandibular Posterior' },
];

// IB - Typodont case options
const ibTypodontCaseOptions = [
  { value: 'class3_co_case_1', label: 'Class 3 (CO) - Case 1' },
  { value: 'class3_co_case_2', label: 'Class 3 (CO) - Case 2' },
  { value: 'class4_co_case_1', label: 'Class 4 (CO) - Case 1' },
  { value: 'class5_co_case_1', label: 'Class 5 (CO) - Class 1' },
  { value: 'class5_co_case_2', label: 'Class 5 (CO) - Class 2' },
  { value: 'pfm_crown_anterior_case_1', label: 'Porcelain Fused To Metal Crown Anterior: Anterior - Case 1' },
  { value: 'pfm_crown_posterior_case_1', label: 'Porcelain Fused To Metal Crown Anterior: Posterior - Case 1' },
];

// IIA - Typodont case options
const iiaTypodontCaseOptions = [
  { value: 'class2_prep_case_1', label: 'Class 2 Prep - Case 1' },
  { value: 'class2_prep_case_2', label: 'Class 2 Prep - Case 2' },
  { value: 'class2_max_prep_co_case_1', label: 'Class 2 Max Prep and CO - Case 1' },
];

// IIB - Typodont case options
const iibTypodontCaseOptions = [
  { value: 'class2_mand_prep_co_case_1', label: 'Class 2 Mand Prep and CO - Case 1' },
  { value: 'class3_co_case_1', label: 'Class 3 (CO) - Case 1' },
  { value: 'class3_co_case_2', label: 'Class 3 (CO) - Case 2' },
  { value: 'class3_co_case_3', label: 'Class 3 (CO) - Case 3' },
  { value: 'class4_co_case_1', label: 'Class 4 (CO) - Case 1' },
  { value: 'class5_co_case_1', label: 'Class 5 (CO) - Case 1' },
  { value: 'class5_co_case_2', label: 'Class 5 (CO) - Case 2' },
  { value: 'fpd_max_anterior_case_1', label: 'Fixed Partial Denture: Maxillary Anterior - Case 1' },
  { value: 'fpd_max_posterior_case_1', label: 'Fixed Partial Denture: Maxillary Posterior - Case 1' },
];

// IIIA - Typodont case options
const iiiaTypodontCaseOptions = [
  { value: 'class2_max_prep_co_case_1', label: 'Class 2 Max Prep and CO - Case 1' },
  { value: 'class2_mand_prep_co_case_1', label: 'Class 2 Mand Prep and CO - Case 1' },
  { value: 'class1_am_prep_case_1', label: 'Class 1 AM Prep - Case 1' },
  { value: 'class2_am_prep_case_1', label: 'Class 2 AM Prep - Case 1' },
  { value: 'fpd_posterior_case_1', label: 'Fixed Partial Denture: Posterior - Case 1' },
];

// IA - Scaling and Polishing case options
const iaScalingPolishingCaseOptions = [
  { value: 'moderate_case_1', label: 'Moderate - Case 1' },
  { value: 'moderate_case_2', label: 'Moderate - Case 2' },
  { value: 'moderate_case_3', label: 'Moderate - Case 3' },
];

// IB - Scaling and Polishing case options
const ibScalingPolishingCaseOptions = [
  { value: 'moderate_case_1', label: 'Moderate - Case 1' },
  { value: 'moderate_case_2', label: 'Moderate - Case 2' },
];

// IIA - Scaling and Polishing case options
const iiaScalingPolishingCaseOptions = [
  { value: 'moderate_severe_case_1', label: 'Moderate/Severe - Case 1' },
  { value: 'moderate_severe_case_2', label: 'Moderate/Severe - Case 2' },
  { value: 'moderate_severe_case_3', label: 'Moderate/Severe - Case 3' },
];

// IIB - Scaling and Polishing case options
const iibScalingPolishingCaseOptions = [
  { value: 'moderate_severe_case_1', label: 'Moderate/Severe - Case 1' },
  { value: 'moderate_severe_case_2', label: 'Moderate/Severe - Cast 2' },
];

// IIIA - Scaling and Polishing case options
const iiiaScalingPolishingCaseOptions = [
  { value: 'moderate_severe_case_1', label: 'Moderate/Severe - Case 1' },
  { value: 'moderate_severe_case_2', label: 'Moderate/Severe - Case 2' },
  { value: 'moderate_severe_case_3', label: 'Moderate/Severe - Case 3' },
  { value: 'non_surgical_root_planning_case_1', label: 'Non-Surgical Root Planning - Case 1' },
];

// IIA - Oral Surgery case options
const iiaOralSurgeryCaseOptions = [
  { value: 'max_ant_case_1', label: 'Max Ant - Case 1' },
  { value: 'max_ant_case_2', label: 'Max Ant - Case 2' },
  { value: 'max_ant_case_3', label: 'Max Ant - Case 3' },
  { value: 'mand_ant_case_1', label: 'Mand Ant - Case 1' },
  { value: 'mand_ant_case_2', label: 'Mand Ant - Case 2' },
  { value: 'mand_ant_case_3', label: 'Mand Ant - Case 3' },
];

// IIB - Oral Surgery case options
const iibOralSurgeryCaseOptions = [
  { value: 'max_post_case_1', label: 'Max Post - Case 1' },
  { value: 'max_post_case_2', label: 'Max Post - Case 2' },
  { value: 'max_post_case_3', label: 'Max Post - Case 3' },
  { value: 'max_post_case_4', label: 'Max Post - Case 4' },
  { value: 'max_post_case_5', label: 'Max Post - Case 5' },
  { value: 'mand_post_case_1', label: 'Mand Post - Case 1' },
  { value: 'mand_post_case_2', label: 'Mand Post - Case 2' },
  { value: 'mand_post_case_3', label: 'Mand Post - Case 3' },
  { value: 'mand_post_case_4', label: 'Mand Post - Case 4' },
  { value: 'mand_post_case_5', label: 'Mand Post - Case 5' },
];

// IIIA - Oral Surgery case options
const iiiaOralSurgeryCaseOptions = [
  { value: 'max_ant_case_1', label: 'Max Ant - Case 1' },
  { value: 'max_ant_case_2', label: 'Max Ant - Case 2' },
  { value: 'max_ant_case_3', label: 'Max Ant - Case 3' },
  { value: 'mand_ant_case_1', label: 'Mand Ant - Case 1' },
  { value: 'mand_ant_case_2', label: 'Mand Ant - Case 2' },
  { value: 'mand_ant_case_3', label: 'Mand Ant - Case 3' },
];

// IIA - Oral Diagnosis case options
const iiaOralDiagnosisCaseOptions = [
  { value: 'case_discussion_case_1', label: 'Case Discussion - Case 1' },
];

// IIB - Oral Diagnosis case options
const iibOralDiagnosisCaseOptions = [
  { value: 'oral_rehab_case_1', label: 'Oral Rehab - Case 1' },
];

// IIIA - Oral Diagnosis case options
const iiiaOralDiagnosisCaseOptions = [
  { value: 'case_discussion_case_1', label: 'Case Discussion - Case 1' },
];

// IIA - Endodontics case options
const iiaEndodonticsCaseOptions = [
  { value: 'anterior_mono_rooted_case_1', label: 'Anterior Mono-Rooted - Case 1' },
];

// IIIA - Endodontics case options
const iiiaEndodonticsCaseOptions = [
  { value: 'posterior_multi_rooted_case_1', label: 'Posterior Multi-Rooted - Case 1' },
];

// IA - Prosthodontics case options
const iaProsthodonticsCaseOptions = [
  { value: 'maxillary_rpd_bilateral_case_1', label: 'Maxillary RPD (Bilateral) - Case 1' },
  { value: 'mandibular_rpd_bilateral_case_1', label: 'Mandibular RPD (Bilateral) - Case 1' },
  { value: 'pfm_crown_anterior_case_1', label: 'Porcelain Fused To Metal Crown (Anterior) - Case 1' },
  { value: 'acrylic_crown_anterior_case_1', label: 'All Acrylic Crown (Anterior) - Case 1' },
];

// IB - Prosthodontics case options
const ibProsthodonticsCaseOptions = [
  { value: 'complete_denture_case_1', label: 'Complete Denture - Case 1' },
];

// IIA - Prosthodontics case options
const iiaProsthodonticsCaseOptions = [
  { value: 'pfm_crown_anterior_case_1', label: 'Porcelain Fused To Metal Crown (Anterior) - Case 1' },
];

// IIB - Prosthodontics case options
const iibProsthodonticsCaseOptions = [
  { value: 'maxillary_rpd_bilateral_case_1', label: 'Maxillary RPD (Bilateral) - Case 1' },
  { value: 'mandibular_rpd_bilateral_case_1', label: 'Mandibular RPD (Bilateral) - Case 1' },
  { value: 'complete_denture_case_1', label: 'Complete Denture - Case 1' },
];

// IIIA - Prosthodontics case options
const iiiaProsthodonticsCaseOptions = [
  { value: 'fpd_posterior_case_1', label: 'Fixed Partial Denture (Posterior) - Case 1' },
  { value: 'pfm_crown_anterior_case_1', label: 'Porcelain Fused To Metal Crown (Anterior) - Case 1' },
  { value: 'pfm_crown_posterior_case_1', label: 'Porcelain Fused To Metal Crown (Posterior) - Case 1' },
];

// IA - Restorative Dentistry case options
const iaRestorativeDentistryCaseOptions = [
  { value: 'class1_co_case_1', label: 'Class 1 CO - Case 1' },
  { value: 'class1_co_case_2', label: 'Class 1 CO - Case 2' },
  { value: 'class2_co_case_1', label: 'Class 2 CO - Case 1' },
  { value: 'class2_co_case_2', label: 'Class 2 CO - Case 2' },
];

// IB - Restorative Dentistry case options
const ibRestorativeDentistryCaseOptions = [
  { value: 'class3_composite_case_1', label: 'Class 3 (Composite) - Case 1' },
  { value: 'class4_composite_case_1', label: 'Class 4 (Composite) - Case 1' },
  { value: 'class5_composite_case_1', label: 'Class 5 (Composite) - Case 1' },
];

// IIA - Restorative Dentistry case options
const iiaRestorativeDentistryCaseOptions = [
  { value: 'class1_co_case_1', label: 'Class 1 CO - Case 1' },
  { value: 'class1_co_case_2', label: 'Class 1 CO - Case 2' },
];

// IIB - Restorative Dentistry case options
const iibRestorativeDentistryCaseOptions = [
  { value: 'class2_composite_case_1', label: 'Class 2 (Composite) - Case 1' },
  { value: 'class2_composite_case_2', label: 'Class 2 (Composite) - Case 2' },
  { value: 'class3_composite_case_1', label: 'Class 3 (Composite) - Case 1' },
  { value: 'class4_composite_case_1', label: 'Class 4 (Composite) - Case 1' },
  { value: 'class5_composite_case_1', label: 'Class 5 (Composite) - Case 1' },
];

// IIIA - Restorative Dentistry case options
const iiiaRestorativeDentistryCaseOptions = [
  { value: 'class1_co_case_1', label: 'Class 1 (CO) - Case 1' },
  { value: 'class1_co_case_2', label: 'Class 1 (CO) - Case 2' },
  { value: 'class1_co_case_3', label: 'Class 1 (CO) - Case 3' },
  { value: 'class1_co_case_4', label: 'Class 1 (CO) - Case 4' },
  { value: 'class2_co_case_1', label: 'Class 2 (CO) - Case 1' },
];

// IA - Penalty case options
const iaPenaltyCaseOptions = [
  { value: 'penalty_case_1', label: 'Penalty - Case 1' },
  { value: 'penalty_case_2', label: 'Penalty - Case 2' },
  { value: 'penalty_case_3', label: 'Penalty - Case 3' },
  { value: 'penalty_case_4', label: 'Penalty - Case 4' },
  { value: 'penalty_case_5', label: 'Penalty - Case 5' },
];

// IB - Penalty case options
const ibPenaltyCaseOptions = [
  { value: 'penalty_case_1', label: 'Penalty - Case 1' },
  { value: 'penalty_case_2', label: 'Penalty - Case 2' },
  { value: 'penalty_case_3', label: 'Penalty - Case 3' },
  { value: 'penalty_case_4', label: 'Penalty - Case 4' },
  { value: 'penalty_case_5', label: 'Penalty - Case 5' },
  { value: 'penalty_case_6', label: 'Penalty - Case 6' },
  { value: 'penalty_case_7', label: 'Penalty - Case 7' },
];

// IIA - Penalty case options
const iiaPenaltyCaseOptions = [
  { value: 'penalty_case_1', label: 'Penalty - Case 1' },
  { value: 'penalty_case_2', label: 'Penalty - Case 2' },
  { value: 'penalty_case_3', label: 'Penalty - Case 3' },
  { value: 'penalty_case_4', label: 'Penalty - Case 4' },
  { value: 'penalty_case_5', label: 'Penalty - Case 5' },
  { value: 'penalty_case_6', label: 'Penalty - Case 6' },
  { value: 'penalty_case_7', label: 'Penalty - Case 7' },
];

// IIB - Penalty case options
const iibPenaltyCaseOptions = [
  { value: 'penalty_case_1', label: 'Penalty - Case 1' },
  { value: 'penalty_case_2', label: 'Penalty - Case 2' },
  { value: 'penalty_case_3', label: 'Penalty - Case 3' },
  { value: 'penalty_case_4', label: 'Penalty - Case 4' },
  { value: 'penalty_case_5', label: 'Penalty - Case 5' },
  { value: 'penalty_case_6', label: 'Penalty - Case 6' },
  { value: 'penalty_case_7', label: 'Penalty - Case 7' },
  { value: 'penalty_case_8', label: 'Penalty - Case 8' },
  { value: 'penalty_case_9', label: 'Penalty - Case 9' },
  { value: 'penalty_case_10', label: 'Penalty - Case 10' },
  { value: 'penalty_case_11', label: 'Penalty - Case 11' },
  { value: 'penalty_case_12', label: 'Penalty - Case 12' },
  { value: 'penalty_case_13', label: 'Penalty - Case 13' },
];

// IIIA - Penalty case options
const iiiaPenaltyCaseOptions = [
  { value: 'penalty_case_1', label: 'Penalty - Case 1' },
  { value: 'penalty_case_2', label: 'Penalty - Case 2' },
];

// IIIB Section options
const iiibSectionOptions = [
  { value: 'typodont', label: 'Typodont' },
  { value: 'scaling_and_polishing', label: 'Scaling and Polishing' },
  { value: 'oral_surgery', label: 'Oral Surgery' },
  { value: 'oral_diagnosis', label: 'Oral Diagnosis' },
  { value: 'orthodontics', label: 'Orthodontics' },
  { value: 'prosthodontics', label: 'Prosthodontics' },
  { value: 'restorative_dentistry', label: 'Restorative Dentistry' },
  { value: 'penalty', label: 'Penalty' },
];

// IIIB - Typodont case options
const iiibTypodontCaseOptions = [
  { value: 'class3_co_case_1', label: 'Class 3 (CO) - Case 1' },
  { value: 'class3_co_case_2', label: 'Class 3 (CO) - Case 2' },
  { value: 'class5_co_case_1', label: 'Class 5 (CO) - Case 1' },
  { value: 'fpd_anterior_case_1', label: 'Fixed Partial Denture: Anterior - Case 1' },
];

// IIIB - Scaling and Polishing case options
const iiibScalingPolishingCaseOptions = [
  { value: 'moderate_severe_case_1', label: 'Moderate/Severe - Case 1' },
  { value: 'moderate_severe_case_2', label: 'Moderate/Severe - Case 2' },
  { value: 'crown_lengthening_case_1', label: 'Crown Lengthening - Case 1' },
];

// IIIB - Oral Surgery case options
const iiibOralSurgeryCaseOptions = [
  { value: 'max_post_case_1', label: 'Max Post - Case 1' },
  { value: 'max_post_case_2', label: 'Max Post - Case 2' },
  { value: 'max_post_case_3', label: 'Max Post - Case 3' },
  { value: 'max_post_case_4', label: 'Max Post - Case 4' },
  { value: 'max_post_case_5', label: 'Max Post - Case 5' },
  { value: 'mand_post_case_1', label: 'Mand Post - Case 1' },
  { value: 'mand_post_case_2', label: 'Mand Post - Case 2' },
  { value: 'mand_post_case_3', label: 'Mand Post - Case 3' },
  { value: 'mand_post_case_4', label: 'Mand Post - Case 4' },
  { value: 'mand_post_case_5', label: 'Mand Post - Case 5' },
  { value: 'special_case_open_flap_case_1', label: 'Special Case (Open Flap) - Case 1' },
];

// IIIB - Oral Diagnosis case options
const iiibOralDiagnosisCaseOptions = [
  { value: 'oral_rehab_case_1', label: 'Oral Rehab - Case 1' },
];

// IIIB - Orthodontics case options
const iiibOrthodonticsCaseOptions = [
  { value: 'interceptive_appliance_case_1', label: 'Interceptive Appliance - Case 1' },
];

// IIIB - Prosthodontics case options
const iiibProsthodonticsCaseOptions = [
  { value: 'rpd_max_or_mand_case_1', label: 'RPD (Max or Mand) - Case 1' },
  { value: 'complete_denture_case_1', label: 'Complete Denture - Case 1' },
];

// IIIB - Restorative Dentistry case options
const iiibRestorativeDentistryCaseOptions = [
  { value: 'class3_composite_case_1', label: 'Class 3 (Composite) - Case 1' },
  { value: 'class3_composite_case_2', label: 'Class 3 (Composite) - Case 2' },
  { value: 'class4_composite_case_1', label: 'Class 4 (Composite) - Case 1' },
  { value: 'class5_composite_case_1', label: 'Class 5 (Composite) - Case 1' },
];

// IIIB - Penalty case options
const iiibPenaltyCaseOptions = [
  { value: 'penalty_case_1', label: 'Penalty - Case 1' },
  { value: 'penalty_case_2', label: 'Penalty - Case 2' },
];

const ivaSectionOptions = [
  { value: 'typodont', label: 'Typodont' },
  { value: 'scaling_and_polishing', label: 'Scaling and Polishing' },
  { value: 'oral_surgery', label: 'Oral Surgery' },
  { value: 'endodontics', label: 'Endodontics' },
  { value: 'orthodontics', label: 'Orthodontics' },
  { value: 'prosthodontics', label: 'Prosthodontics' },
  { value: 'restorative_dentistry', label: 'Restorative Dentistry' },
  { value: 'penalty', label: 'Penalty' },
];

// IVA - Typodont case options
const ivaTypodontCaseOptions = [
  { value: 'class2_max_prep_only_case_1', label: 'Class 2 Max Prep Only - Case 1' },
  { value: 'class2_mand_prep_only_case_2', label: 'Class 2 Mand Prep Only - Case 2' },
  { value: 'fpd_anterior_case_1', label: 'Fixed Partial Denture: Anterior - Case 1' },
  { value: 'fpd_posterior_case_1', label: 'Fixed Partial Denture: Posterior - Case 1' },
];

// IVA - Scaling and Polishing case options
const ivaScalingPolishingCaseOptions = [
  { value: 'scaling_and_polishing_case_1', label: 'Scaling and Polishing - Case 1' },
  { value: 'scaling_and_polishing_case_2', label: 'Scaling and Polishing - Case 2' },
  { value: 'scaling_and_polishing_case_3', label: 'Scaling and Polishing - Case 3' },
];

// IVA - Oral Surgery case options
const ivaOralSurgeryCaseOptions = [
  { value: 'max_post_case_1', label: 'Max Post - Case 1' },
  { value: 'max_post_case_2', label: 'Max Post - Case 2' },
  { value: 'max_post_case_3', label: 'Max Post - Case 3' },
  { value: 'max_post_case_4', label: 'Max Post - Case 4' },
  { value: 'max_post_case_5', label: 'Max Post - Case 5' },
  { value: 'mand_post_case_1', label: 'Mand Post - Case 1' },
  { value: 'mand_post_case_2', label: 'Mand Post - Case 2' },
  { value: 'mand_post_case_3', label: 'Mand Post - Case 3' },
  { value: 'mand_post_case_4', label: 'Mand Post - Case 4' },
  { value: 'mand_post_case_5', label: 'Mand Post - Case 5' },
  { value: 'odontectomy_case_1', label: 'Odontectomy - Case 1' },
];

// IVA - Endodontics case options
const ivaEndodonticsCaseOptions = [
  { value: 'immediate_rotary_case_1', label: 'Immediate/Rotary - Case 1' },
];

// IVA - Orthodontics case options
const ivaOrthodonticsCaseOptions = [
  { value: 'interceptive_appliance_case_1', label: 'Interceptive Appliance - Case 1' },
  { value: 'cephalometric_radiograph_case_1', label: 'Cephalometric Radiograph - Case 1' },
];

// IVA - Prosthodontics case options
const ivaProsthodonticsCaseOptions = [
  { value: 'fpd_ant_post_abutments_case_1', label: 'FPD (Ant. And Post Abutments) - Case 1' },
  { value: 'maxillary_rpd_case_1', label: 'Maxillary RPD - Case 1' },
  { value: 'mandibular_rpd_case_1', label: 'Mandibular RPD - Case 1' },
];

// IVA - Restorative Dentistry case options
const ivaRestorativeDentistryCaseOptions = [
  { value: 'class1_co_case_1', label: 'Class 1 (CO) - Case 1' },
  { value: 'class1_co_case_2', label: 'Class 1 (CO) - Case 2' },
  { value: 'class1_co_case_3', label: 'Class 1 (CO) - Case 3' },
];

// IVA - Penalty case options
const ivaPenaltyCaseOptions = [
  { value: 'penalty_case_1', label: 'Penalty - Case 1' },
  { value: 'penalty_case_2', label: 'Penalty - Case 2' },
];

// IVB Section options
const ivbSectionOptions = [
  { value: 'prosthodontics', label: 'Prosthodontics' },
  { value: 'restorative_dentistry', label: 'Restorative Dentistry' },
  { value: 'penalty', label: 'Penalty' },
];

// IVB - Prosthodontics case options
const ivbProsthodonticsCaseOptions = [
  { value: 'fpd_cpet_case_1', label: 'Fixed Partial Denture (CPET) - Case 1' },
  { value: 'complete_denture_cpet_case_1', label: 'Complete Denture (CPET) - Case 1' },
  { value: 'rpd_cpet_case_1', label: 'RPD (CPET) - Case 1' },
];

// IVB - Restorative Dentistry case options
const ivbRestorativeDentistryCaseOptions = [
  { value: 'class1_cpet_case_1', label: 'Class 1 (CPET) - Case 1' },
  { value: 'class2_cpet_case_1', label: 'Class 2 (CPET) - Case 1' },
];

// IVB - Penalty case options
const ivbPenaltyCaseOptions = [
  { value: 'penalty_case_1', label: 'Penalty - Case 1' },
  { value: 'penalty_case_2', label: 'Penalty - Case 2' },
  { value: 'penalty_case_3', label: 'Penalty - Case 3' },
  { value: 'penalty_case_4', label: 'Penalty - Case 4' },
  { value: 'penalty_case_5', label: 'Penalty - Case 5' },
  { value: 'penalty_case_6', label: 'Penalty - Case 6' },
  { value: 'penalty_case_7', label: 'Penalty - Case 7' },
  { value: 'penalty_case_8', label: 'Penalty - Case 8' },
  { value: 'penalty_case_9', label: 'Penalty - Case 9' },
];



const CaseSubmission = () => {
  TitleHead('Case Submission');
  const { user } = useContext(UserContext);
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const {message:messageApi} = App.useApp();
  // State management
  const [selectedTallySheet, setSelectedTallySheet] = useState(null);
  const [selectedSections, setSelectedSections] = useState([]);
  const [selectedCases, setSelectedCases] = useState([]);
  const [patientName, setPatientName] = useState();
  const [procedureDone, setProcedureDone] = useState('');
  const [comments, setComments] = useState('');

  // Handle tally sheet selection
  const handleTallySheetChange = (selected) => {
    setSelectedTallySheet(selected);
    setSelectedSections([]);
    setSelectedCases([]);
  };

  // Handle section selection
  const handleSectionChange = (selected) => {
    setSelectedSections(selected);
    setSelectedCases([]);
  };

  // Handle case selection
  const handleCaseChange = (selected) => {
    setSelectedCases(selected);
  };

const getSectionOptions = (tallySheetValue) => {
  switch(tallySheetValue) {
    case 'IA':
      return iaSectionOptions;
    case 'IB':
      return ibSectionOptions;
    case 'IIA':
      return iiaSectionOptions;
    case 'IIB':
      return iibSectionOptions;
    case 'IIIA':
      return iiiaSectionOptions;
    case 'IIIB':
      return iiibSectionOptions;
    case 'IVA':
      return ivaSectionOptions;
case 'IVB':
  return ivbSectionOptions;
    default:
      return [];
  }
};


  // Get case options based on selected tally sheet and section
  const getCaseOptions = (tallySheetValue, sectionValue) => {
    if (tallySheetValue === 'IA') {
      switch(sectionValue) {
        case 'typodont':
          return iaTypodontCaseOptions;
        case 'scaling_and_polishing':
          return iaScalingPolishingCaseOptions;
        case 'prosthodontics':
          return iaProsthodonticsCaseOptions;
        case 'restorative_dentistry':
          return iaRestorativeDentistryCaseOptions;
        case 'penalty':
          return iaPenaltyCaseOptions;
        default:
          return [];
      }
    } else if (tallySheetValue === 'IB') {
      switch(sectionValue) {
        case 'typodont':
          return ibTypodontCaseOptions;
        case 'scaling_and_polishing':
          return ibScalingPolishingCaseOptions;
        case 'prosthodontics':
          return ibProsthodonticsCaseOptions;
        case 'restorative_dentistry':
          return ibRestorativeDentistryCaseOptions;
        case 'penalty':
          return ibPenaltyCaseOptions;
        default:
          return [];
      }
    } else if (tallySheetValue === 'IIA') {
      switch(sectionValue) {
        case 'typodont':
          return iiaTypodontCaseOptions;
        case 'scaling_and_polishing':
          return iiaScalingPolishingCaseOptions;
        case 'oral_surgery':
          return iiaOralSurgeryCaseOptions;
        case 'oral_diagnosis':
          return iiaOralDiagnosisCaseOptions;
        case 'endodontics':
          return iiaEndodonticsCaseOptions;
        case 'prosthodontics':
          return iiaProsthodonticsCaseOptions;
        case 'restorative_dentistry':
          return iiaRestorativeDentistryCaseOptions;
        case 'penalty':
          return iiaPenaltyCaseOptions;
        default:
          return [];
      }
    } else if (tallySheetValue === 'IIB') {
      switch(sectionValue) {
        case 'typodont':
          return iibTypodontCaseOptions;
        case 'scaling_and_polishing':
          return iibScalingPolishingCaseOptions;
        case 'oral_surgery':
          return iibOralSurgeryCaseOptions;
        case 'oral_diagnosis':
          return iibOralDiagnosisCaseOptions;
        case 'prosthodontics':
          return iibProsthodonticsCaseOptions;
        case 'restorative_dentistry':
          return iibRestorativeDentistryCaseOptions;
        case 'penalty':
          return iibPenaltyCaseOptions;
        default:
          return [];
      }
    } else if (tallySheetValue === 'IIIA') {
      switch(sectionValue) {
        case 'typodont':
          return iiiaTypodontCaseOptions;
        case 'scaling_and_polishing':
          return iiiaScalingPolishingCaseOptions;
        case 'oral_surgery':
          return iiiaOralSurgeryCaseOptions;
        case 'oral_diagnosis':
          return iiiaOralDiagnosisCaseOptions;
        case 'endodontics':
          return iiiaEndodonticsCaseOptions;
        case 'prosthodontics':
          return iiiaProsthodonticsCaseOptions;
        case 'restorative_dentistry':
          return iiiaRestorativeDentistryCaseOptions;
        case 'penalty':
          return iiiaPenaltyCaseOptions;
        default:
          return [];
      }
    }else if (tallySheetValue === 'IIIB') {
    switch(sectionValue) {
      case 'typodont':
        return iiibTypodontCaseOptions;
      case 'scaling_and_polishing':
        return iiibScalingPolishingCaseOptions;
      case 'oral_surgery':
        return iiibOralSurgeryCaseOptions;
      case 'oral_diagnosis':
        return iiibOralDiagnosisCaseOptions;
      case 'orthodontics':
        return iiibOrthodonticsCaseOptions;
      case 'prosthodontics':
        return iiibProsthodonticsCaseOptions;
      case 'restorative_dentistry':
        return iiibRestorativeDentistryCaseOptions;
      case 'penalty':
        return iiibPenaltyCaseOptions;
      default:
        return [];
    }
  } else if (tallySheetValue === 'IVA') {
    switch(sectionValue) {
      case 'typodont':
        return ivaTypodontCaseOptions;
      case 'scaling_and_polishing':
        return ivaScalingPolishingCaseOptions;
      case 'oral_surgery':
        return ivaOralSurgeryCaseOptions;
      case 'endodontics':
        return ivaEndodonticsCaseOptions;
      case 'orthodontics':
        return ivaOrthodonticsCaseOptions;
      case 'prosthodontics':
        return ivaProsthodonticsCaseOptions;
      case 'restorative_dentistry':
        return ivaRestorativeDentistryCaseOptions;
      case 'penalty':
        return ivaPenaltyCaseOptions;
      default:
        return [];
    }
  }// Add to getCaseOptions function
else if (tallySheetValue === 'IVB') {
  switch(sectionValue) {
    case 'prosthodontics':
      return ivbProsthodonticsCaseOptions;
    case 'restorative_dentistry':
      return ivbRestorativeDentistryCaseOptions;
    case 'penalty':
      return ivbPenaltyCaseOptions;
    default:
      return [];
  }
}
    return [];
  };
  useEffect(() => {
    fetchPatientData();
  }, [id]);
 const fetchPatientData = async () => {
    try {
      const response = await axios.get(`${API_URL}/patient/get/${id}`);
      const data = response.data;
      console.log('Patient data:', data);
      setPatientName(data);
    }catch (error) {
      console.error('Error fetching patient data:', error);
    }
  };

  // Handle form submission
// Handle form submission
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!selectedTallySheet) {
    messageApi.error('Please select a tally sheet');
    return;
  }

  if (selectedSections.length === 0) {
    messageApi.error('Please select at least one section');
    return;
  }

  if (selectedCases.length === 0) {
    messageApi.error('Please select at least one case title');
    return;
  }

  const submissionData = {
    tallySheet: selectedTallySheet.value,
    section: selectedSections[0].value, // Take the first selected section
    caseTitle: selectedCases[0].value, // Take the first selected case
    procedure: procedureDone,
    description: comments,
  };
  
  console.log('Submission data:', submissionData);
  
  try {
    const response = await axios.post(
      `${API_URL}/clinician/${user.id}/create/submission/${id}`,
      submissionData
    );
    if (response.data.success) {
      messageApi.success('Case submitted successfully');
      navigate(`/patient/${id}`)
    } else {
      messageApi.error(response.data.message || 'Error submitting case');
    }
  } catch (err) {
    console.error('Submission error:', err);
    messageApi.error(err.response?.data?.message || 'Error submitting case');
  }
};

  // Reset form fields
  // const resetForm = () => {
  //   setSelectedTallySheet(null);
  //   setSelectedSections([]);
  //   setSelectedCases([]);
  //   setPatientName('');
  //   setProcedureDone('');
  //   setComments('');
  // };

  // Determine if we should show section selector
  const showSectionSelector = selectedTallySheet !== null;
  
const showCaseSelector = 
  (selectedTallySheet?.value === 'IA' || selectedTallySheet?.value === 'IB' || 
   selectedTallySheet?.value === 'IIA' || selectedTallySheet?.value === 'IIB' || 
   selectedTallySheet?.value === 'IIIA' || selectedTallySheet?.value === 'IIIB' ||
   selectedTallySheet?.value === 'IVA' || selectedTallySheet?.value === 'IVB') && 
  selectedSections.length > 0;

  // Get all case options for selected sections
  const allCaseOptions = selectedSections.flatMap(section => 
    getCaseOptions(selectedTallySheet?.value, section.value)
  );

  return (
    <Container fluid className="py-4">
      <Row className="justify-content-center">
        <Col xs={12} lg={10} xl={8}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0 fs-5">Case Submission</h4>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                {/* Tally Sheet Selection */}
                <Form.Group className="mb-4">
                  <Form.Label>Select Tally Sheet</Form.Label>
                  <Select
                    value={selectedTallySheet}
                    onChange={handleTallySheetChange}
                    options={tallySheetOptions}
                    placeholder="Select a tally sheet..."
                    className="basic-select"
                    classNamePrefix="select"
                  />
                </Form.Group>

                {/* Section Selection - Only show if tally sheet is selected */}
                {showSectionSelector && (
                  <Form.Group className="mb-4">
                    <Form.Label>
                      Select Section{selectedTallySheet?.value === 'IA' || selectedTallySheet?.value === 'IB' || 
                                      selectedTallySheet?.value === 'IIA' || selectedTallySheet?.value === 'IIB' ? 's' : ''}
                    </Form.Label>
                    <Select
                      value={selectedSections}
                      onChange={handleSectionChange}
                      options={getSectionOptions(selectedTallySheet?.value)}
                      placeholder="Select section(s)..."
                      isMulti
                      className="basic-multi-select"
                      classNamePrefix="select"
                    />
                  </Form.Group>
                )}

                {/* Case Selection - Show for any selected IA, IB, IIA, or IIB section */}
                {showCaseSelector && allCaseOptions.length > 0 && (
                  <Form.Group className="mb-4">
                    <Form.Label>Select Cases</Form.Label>
                    <Select
                      value={selectedCases}
                      onChange={handleCaseChange}
                      options={allCaseOptions}
                      placeholder="Select case(s)..."
                      isMulti
                      className="basic-multi-select"
                      classNamePrefix="select"
                    />
                  </Form.Group>
                )}

                {/* Patient Information */}
                <Card className="mb-4">
                  <Card.Header className="bg-light">
                    <h5 className="mb-0 fs-6">Case Information</h5>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Patient Name</Form.Label>
                          <h5 className="mb-0 fs-6">{patientName?.firstname} {patientName?.middlename?patientName.middlename:" "}{patientName?.lastname}</h5>
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Illness History</Form.Label>
                          <h5 className="mb-0 fs-6">{patientName?.illnessHistory}</h5>
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Chief of Complain</Form.Label>
                          <h5 className="mb-0 fs-6">{patientName?.chiefComplaint} </h5>
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Procedure Done</Form.Label>
                          <Form.Control 
                            type="text" 
                            value={procedureDone}
                            onChange={(e) => setProcedureDone(e.target.value)}
                            placeholder="Enter Treatment Done"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {/* Comments */}
                <Form.Group className="mb-4">
                  <Form.Label>Additional Comments</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={3}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Enter any additional information or comments about this case submission"
                  />
                </Form.Group>

                {/* Action Buttons */}
                <div className="form-action-buttons mt-4">
                  <div className="row g-2">
                    <div className="col-12 col-md-6 order-md-2">
                      <Button 
                        variant="primary" 
                        type="submit" 
                        className="w-100 btn-submit"
                      >
                        Submit Case
                      </Button>
                    </div>
                    <div className="col-12 col-md-6 order-md-1">
                      <Button 
                        variant="secondary" 
                        className="w-100 btn-back"
                        onClick={() => navigate(-1)}
                      >
                        Back
                      </Button>
                    </div>
                  </div>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CaseSubmission;